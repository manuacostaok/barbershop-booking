const mongoose = require("mongoose");

const dayOffSchema = new mongoose.Schema({
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: String, // "2026-05-10"
});

module.exports = mongoose.model("DayOff", dayOffSchema);