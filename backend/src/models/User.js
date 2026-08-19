const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["admin", "barber", "client"],
    default: "client", // 🔥 AHORA CLIENT POR DEFECTO
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  avatar: {
    type: String,
    default: "",
  },

  banner: {
    type: String,
    default: "",
  },

  // 🗓️ Disponibilidad semanal — la carga el admin al editar al
  // barbero. Si queda vacío (barbero sin configurar todavía),
  // el sistema sigue usando el horario general del negocio como
  // hasta ahora — no rompe nada para los que ya existían.
  schedule: [
    {
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=domingo ... 6=sábado
      active: { type: Boolean, default: true },
      start: { type: String, default: "09:00" },
      end: { type: String, default: "18:00" },
    },
  ],

  // 💰 SISTEMA DE PUNTOS
  points: {
    type: Number,
    default: 0,
  },

  // 📜 HISTORIAL
  appointmentsHistory: [
    {
      service: String,
      barber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      date: String,
      time: String,
      price: Number,
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);