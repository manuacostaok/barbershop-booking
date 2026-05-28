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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Local", localSchema);