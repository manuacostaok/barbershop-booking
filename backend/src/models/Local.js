const mongoose = require("mongoose");

const localSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Mi Barbería",
    },

    description: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    open: {
      type: String,
      default: "09:00",
    },

    close: {
      type: String,
      default: "22:00",
    },

    interval: {
      type: Number,
      default: 30,
    },

    instagram: {
      type: String,
      default: "",
    },

    // 🎨 Paleta de colores de la página pública — pensado para
    // que el mismo sistema sirva a rubros distintos (barbería,
    // manicura/estética, spa, etc.) sin que se vea "de barbero"
    // para todos.
    theme: {
      type: String,
      enum: ["esmeralda", "rosa", "claro", "nocturno"],
      default: "esmeralda",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Local", localSchema);