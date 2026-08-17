const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    businessName: { type: String },

    plan: {
      type: String,
      enum: ["basico", "pro", "premium"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "cancelled"],
      default: "pending",
    },

    // 🔥 Estos campos quedan listos para cuando se conecte
    // la API real de Suscripciones de Mercado Pago
    mpPreapprovalId: { type: String, default: null },
    mpInitPoint: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
