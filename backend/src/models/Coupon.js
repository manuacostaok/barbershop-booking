const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  service: String,
  code: String,
  usedAt: Date,
  status: { type: String, default: "used" }
});

module.exports = mongoose.model("Coupon", couponSchema);