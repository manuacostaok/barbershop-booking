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