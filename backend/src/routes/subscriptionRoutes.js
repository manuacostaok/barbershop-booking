const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { MercadoPagoConfig, PreApproval } = require("mercadopago");
const Subscription = require("../models/Subscription");

// Planes y precios ARS — única fuente de verdad en el backend
// (el frontend no debe decidir el precio, solo mostrarlo)
const PLANS = {
  basico: { label: "Básico", price: 19999 },
  pro: { label: "Pro", price: 32999 },
  premium: { label: "Premium", price: 54999 },
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// El SDK solo se inicializa si hay Access Token cargado — sin esto
// la app sigue funcionando con el checkout de demostración de antes.
const mpClient = process.env.MP_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
  : null;

// ===============================
// 📌 CREAR INTENCIÓN DE SUSCRIPCIÓN
// ===============================
router.post("/", limiter, async (req, res) => {
  try {
    const { name, email, phone, businessName, plan } = req.body;

    if (!name || !email || !plan) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    if (!PLANS[plan]) {
      return res.status(400).json({ message: "Plan inválido" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const subscription = await Subscription.create({
      name,
      email: normalizedEmail,
      phone,
      businessName,
      plan,
      status: "pending",
    });

    // Sin credenciales de Mercado Pago configuradas: mantenemos el
    // checkout de demostración para poder seguir probando el flujo
    // del frontend sin depender de la API externa.
    if (!mpClient) {
      const mockInitPoint = `${process.env.CLIENT_URL || ""}/planes/checkout-demo?plan=${plan}`;

      return res.status(201).json({
        message: "Solicitud registrada",
        plan: PLANS[plan],
        checkoutUrl: mockInitPoint,
        demo: true,
      });
    }

    try {
      const preapproval = new PreApproval(mpClient);

      const result = await preapproval.create({
        body: {
          reason: `Suscripción ${PLANS[plan].label} - Turnos Ahora`,
          external_reference: String(subscription._id),
          payer_email: normalizedEmail,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: PLANS[plan].price,
            currency_id: "ARS",
          },
          back_url: `${process.env.CLIENT_URL || ""}/planes?status=success`,
          status: "pending",
        },
      });

      subscription.mpPreapprovalId = result.id;
      subscription.mpInitPoint = result.init_point;
      await subscription.save();

      return res.status(201).json({
        message: "Solicitud registrada",
        plan: PLANS[plan],
        checkoutUrl: result.init_point,
        demo: false,
      });
    } catch (mpErr) {
      console.error("ERROR MERCADO PAGO PREAPPROVAL:", mpErr?.message || mpErr);
      // La suscripción ya quedó guardada como "pending" — el negocio
      // no pierde el lead aunque Mercado Pago esté caído en ese momento.
      return res.status(502).json({
        message: "No pudimos conectar con Mercado Pago. Probá de nuevo en unos minutos.",
      });
    }

  } catch (err) {
    console.error("ERROR SUBSCRIPTION:", err);
    res.status(500).json({ message: "Error procesando la suscripción" });
  }
});

router.get("/plans", (req, res) => {
  res.json(PLANS);
});

// ===============================
// 📌 WEBHOOK DE MERCADO PAGO
// Notificaciones de cambios de estado de la suscripción
// (autorizada, pausada, cancelada). Nunca confiamos en el payload
// tal cual llega: siempre volvemos a consultar el estado real a la
// API de Mercado Pago antes de actualizar la base.
// ===============================
router.post("/webhook", async (req, res) => {
  try {
    // Firma opcional (Webhooks v2) — si está configurado el secreto,
    // rechazamos notificaciones que no la traigan válida.
    if (process.env.MP_WEBHOOK_SECRET) {
      const signature = req.headers["x-signature"];
      const requestId = req.headers["x-request-id"];
      const dataId = req.query["data.id"] || req.body?.data?.id;

      if (!signature || !isValidSignature({ signature, requestId, dataId, secret: process.env.MP_WEBHOOK_SECRET })) {
        return res.sendStatus(401);
      }
    }

    const topic = req.query.type || req.query.topic || req.body?.type;
    const preapprovalId = req.query["data.id"] || req.body?.data?.id || req.query.id;

    if (topic !== "preapproval" || !preapprovalId || !mpClient) {
      return res.sendStatus(200);
    }

    const preapproval = new PreApproval(mpClient);
    const result = await preapproval.get({ id: preapprovalId });

    const subscription = await Subscription.findOne({ mpPreapprovalId: preapprovalId });

    if (subscription) {
      const statusMap = {
        authorized: "active",
        paused: "cancelled",
        cancelled: "cancelled",
        pending: "pending",
      };

      subscription.status = statusMap[result.status] || subscription.status;
      await subscription.save();
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("ERROR SUBSCRIPTION WEBHOOK:", err?.message || err);
    // Devolvemos 200 igual: si contestamos error, Mercado Pago
    // reintenta indefinidamente la misma notificación rota.
    res.sendStatus(200);
  }
});

function isValidSignature({ signature, requestId, dataId, secret }) {
  const parts = Object.fromEntries(
    signature.split(",").map((p) => p.trim().split("=").map((s) => s.trim()))
  );

  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(parts.v1);

  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

module.exports = router;
