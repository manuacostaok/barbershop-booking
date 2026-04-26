const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    service: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      default: 30,
    },

    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // 🔥 clave para multi-barbero real
    },

    date: {
      type: String, // "2026-04-25"
      required: true,
    },

    time: {
      type: String, // "14:30"
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed", // 🔥 mejor UX directa
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 ÍNDICE IMPORTANTE (evita duplicados por barbero + horario)
appointmentSchema.index({ date: 1, time: 1, barber: 1 }, { unique: true });

module.exports = mongoose.model("Appointment", appointmentSchema);