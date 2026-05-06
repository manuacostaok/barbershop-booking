
const mongoose = require("mongoose");
const availabilitySchema = new mongoose.Schema({
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  dayOfWeek: Number, // 0 = domingo, 1 = lunes...

  start: String, // "09:00"
  end: String,   // "18:00"

  slotDuration: {
    type: Number,
    default: 30, // minutos
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Availability", availabilitySchema);