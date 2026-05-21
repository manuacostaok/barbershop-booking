const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  open: String,
  close: String,
  interval: Number,

  hasBreak: {
    type: Boolean,
    default: false,
  },
  breakStart: {
    type: String,
    default: "13:00",
  },
  breakEnd: {
    type: String,
    default: "14:00",
  },
});

module.exports = mongoose.model("Config", configSchema);