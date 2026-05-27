const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },

  service: String,

  code: { 
    type: String, 
    unique: true // 🔥 evita duplicados
  },

  // ⏱️ CUANDO SE GENERÓ (lo que vos ya usás)
  usedAt: Date,

  // 🔥 ESTADO (lo dejamos para compatibilidad)
  status: { 
    type: String, 
    default: "used" 
  },

  // =========================
  // 🔥 NUEVO NIVEL DIOS
  // =========================

  // ✔ si ya fue validado por barbero
  redeemed: {
    type: Boolean,
    default: false
  },

  // ⏱️ cuándo lo validó el barbero
  redeemedAt: Date,

  // 👤 qué barbero lo validó
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // ⏳ expiración (anti captura / anti fraude)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 1000 * 60 * 10) // 10 min
  }

}, { timestamps: true }); // 🔥 createdAt / updatedAt

module.exports = mongoose.model("Coupon", couponSchema);