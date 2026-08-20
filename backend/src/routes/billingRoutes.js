const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { PreApproval } = require("mercadopago");
const { mpClient } = require("../config/mercadopago");
const { PLANS } = require("../config/plans");
const Local = require("../models/Local");
const { protect, requireRole } = require("../middlewares/authMiddleware");

// 🔒 Todo acá es solo para el admin de ESTA instancia manejando SU
// PROPIO plan — a diferencia de /api/subscriptions (que es el lead
// público de un cliente nuevo sin instancia todavía). El plan nunca
// se escribe por una request suelta: siempre pasa por Mercado Pago
// primero (alta nueva) o se confirma por webhook (ver subscriptionRoutes.js).

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// ===============================
// 📌 ESTADO ACTUAL DEL PLAN
// ===============================
router.get("/", protect, requireRole("admin"), async (req, res) => {
  try {
    let local = await Local.findOne();
    if (!local) local = await Local.create({});

    res.json({
      plan: local.plan,
      pendingPlan: local.pendingPlan,
      hasActiveSubscription: !!local.mpPreapprovalId,
      plans: PLANS,
    });
  } catch (err) {
    console.error("ERROR BILLING STATUS:", err);
    res.status(500).json({ message: "Error obteniendo el estado del plan" });
  }
});

// ===============================
// 📌 CAMBIAR DE PLAN (upgrade o downgrade)
// ===============================
router.post("/change-plan", protect, requireRole("admin"), limiter, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ message: "Plan inválido" });
    }

    let local = await Local.findOne();
    if (!local) local = await Local.create({});

    if (local.plan === plan && !local.pendingPlan) {
      return res.status(400).json({ message: "Ya tenés ese plan" });
    }

    // Sin Mercado Pago configurado: aplicamos directo para poder
    // seguir probando el resto de la app sin depender de la API externa.
    if (!mpClient) {
      local.plan = plan;
      local.pendingPlan = null;
      await local.save();
      return res.json({ updated: true, demo: true, plan: PLANS[plan] });
    }

    const preapproval = new PreApproval(mpClient);

    // ¿Ya tiene una suscripción activa? La actualizamos en el lugar
    // (mismo medio de pago, no hace falta que vuelva a cargar tarjeta)
    // en vez de crear una segunda y cobrarle dos veces.
    if (local.mpPreapprovalId) {
      let current = null;
      try {
        current = await preapproval.get({ id: local.mpPreapprovalId });
      } catch {
        current = null;
      }

      if (current?.status === "authorized") {
        try {
          await preapproval.update({
            id: local.mpPreapprovalId,
            body: {
              reason: `Suscripción ${PLANS[plan].label} - Turnos Ahora`,
              auto_recurring: {
                transaction_amount: PLANS[plan].price,
                currency_id: "ARS",
              },
            },
          });
        } catch (mpErr) {
          console.error("ERROR MP PREAPPROVAL UPDATE:", mpErr?.message || mpErr);
          return res.status(502).json({
            message: "No pudimos actualizar tu suscripción en Mercado Pago. Probá de nuevo en unos minutos.",
          });
        }

        // Cambio de monto sobre una suscripción ya autorizada: no
        // hace falta esperar confirmación aparte, se aplica ya.
        local.plan = plan;
        local.pendingPlan = null;
        await local.save();

        return res.json({ updated: true, plan: PLANS[plan] });
      }
    }

    // No tiene suscripción activa todavía (primera vez que paga desde
    // su propio panel, o la anterior se canceló/pausó) — hay que
    // crear una nueva y esperar a que la confirme por checkout.
    try {
      const result = await preapproval.create({
        body: {
          reason: `Suscripción ${PLANS[plan].label} - Turnos Ahora`,
          payer_email: req.user.email,
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

      local.mpPreapprovalId = result.id;
      local.pendingPlan = plan;
      await local.save();

      return res.json({ checkoutUrl: result.init_point, demo: false });
    } catch (mpErr) {
      console.error("ERROR MP PREAPPROVAL CREATE:", mpErr?.message || mpErr);
      return res.status(502).json({
        message: "No pudimos conectar con Mercado Pago. Probá de nuevo en unos minutos.",
      });
    }

  } catch (err) {
    console.error("ERROR CHANGE PLAN:", err);
    res.status(500).json({ message: "Error cambiando de plan" });
  }
});

module.exports = router;
