const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  open: { type: String, default: "09:00" },
  close: { type: String, default: "22:00" },
  interval: { type: Number, default: 30 },
});

module.exports = mongoose.model("Config", configSchema);