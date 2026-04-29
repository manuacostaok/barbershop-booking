const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    clientPhone: {
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
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ date: 1, time: 1, barber: 1 }, { unique: true });

module.exports = mongoose.model("Appointment", appointmentSchema);