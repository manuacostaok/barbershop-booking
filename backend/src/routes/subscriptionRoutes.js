const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { MercadoPagoConfig, PreApproval } = require("mercadopago");
const Subscription = require("../models/Subscription");
const Local = require("../models/Local");
const { PLANS } = require("../config/plans");
const { sendNewPaidSubscriptionNotice } = require("../services/email");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const { mpClient } = require("../config/mercadopago");

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

    const statusMap = {
      authorized: "active",
      paused: "cancelled",
      cancelled: "cancelled",
      pending: "pending",
    };

    // Caso 1: lead nuevo capturado en /planes (todavía sin instancia
    // propia — el alta la hacés vos a mano, esto solo marca el lead).
    const subscription = await Subscription.findOne({ mpPreapprovalId: preapprovalId });

    if (subscription) {
      const wasActive = subscription.status === "active";
      subscription.status = statusMap[result.status] || subscription.status;
      await subscription.save();

      // Recién ahora te avisamos — antes no había forma de enterarte
      // de una venta nueva salvo mirando el dashboard de MP a mano.
      if (!wasActive && subscription.status === "active") {
        sendNewPaidSubscriptionNotice({
          name: subscription.name,
          email: subscription.email,
          phone: subscription.phone,
          businessName: subscription.businessName,
          plan: subscription.plan,
          planLabel: PLANS[subscription.plan]?.label,
          mpPreapprovalId: subscription.mpPreapprovalId,
        }).catch((err) => console.error("Error mandando aviso de venta nueva:", err.message));
      }
    }

    // Caso 2: cliente que YA tiene su propia instancia y cambió de
    // plan desde adentro de su panel (ver /api/billing). Acá sí
    // impactamos el plan real apenas Mercado Pago confirma el pago.
    const local = await Local.findOne({ mpPreapprovalId: preapprovalId });

    if (local) {
      if (result.status === "authorized" && local.pendingPlan) {
        local.plan = local.pendingPlan;
        local.pendingPlan = null;
      } else if (result.status === "cancelled" || result.status === "paused") {
        // Dejó de pagar (o canceló) — vuelve al plan gratuito/básico,
        // no se quedan con funciones pagas sin pagar.
        local.plan = "basico";
        local.pendingPlan = null;
        local.mpPreapprovalId = null;
      }

      await local.save();
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
