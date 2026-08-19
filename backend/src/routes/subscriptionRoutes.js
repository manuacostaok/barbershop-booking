const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
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

    const subscription = await Subscription.create({
      name,
      email: String(email).toLowerCase().trim(),
      phone,
      businessName,
      plan,
      status: "pending",
    });

    // =====================================================
    // 🔥 TODO — INTEGRACIÓN REAL CON MERCADO PAGO
    // Cuando tengas el Access Token de tu cuenta de MP,
    // acá se crea el "preapproval" (suscripción recurrente)
    // usando el SDK oficial: https://github.com/mercadopago/sdk-node
    //
    // const mercadopago = require("mercadopago");
    // mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
    //
    // const preapproval = await mercadopago.preapproval.create({
    //   reason: `Suscripción ${PLANS[plan].label} - Barbershop SaaS`,
    //   auto_recurring: {
    //     frequency: 1,
    //     frequency_type: "months",
    //     transaction_amount: PLANS[plan].price,
    //     currency_id: "ARS",
    //   },
    //   payer_email: subscription.email,
    //   back_url: `${process.env.CLIENT_URL}/planes/gracias`,
    // });
    //
    // subscription.mpPreapprovalId = preapproval.body.id;
    // subscription.mpInitPoint = preapproval.body.init_point;
    // await subscription.save();
    //
    // Por ahora devolvemos un checkout simulado para poder
    // probar el flujo completo del lado del frontend.
    // =====================================================

    const mockInitPoint = `${process.env.CLIENT_URL || ""}/planes/checkout-demo?plan=${plan}`;

    res.status(201).json({
      message: "Solicitud registrada",
      plan: PLANS[plan],
      checkoutUrl: mockInitPoint,
      demo: true,
    });

  } catch (err) {
    console.error("ERROR SUBSCRIPTION:", err);
    res.status(500).json({ message: "Error procesando la suscripción" });
  }
});

router.get("/plans", (req, res) => {
  res.json(PLANS);
});

module.exports = router;
