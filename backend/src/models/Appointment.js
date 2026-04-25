const mongoose = require("mongoose");



const appointmentSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    duration: {
        type: Number,
        required: true,
        },
    service: {
      type: String,
      required: true,
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: String, // ej: "2026-04-25"
      required: true,
    },
    time: {
      type: String, // ej: "14:30"
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model("Appointment", appointmentSchema);

