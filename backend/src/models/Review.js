const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    clientName: { type: String, required: true },

    barber: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 500 },

    // 🔥 Las reseñas de 4-5 estrellas se muestran públicas.
    // Las de 1-3 estrellas quedan solo como feedback interno
    // para el admin, nunca se exponen en la página pública.
    isPublic: { type: Boolean, default: false },

    // el admin puede marcarla como leída en su bandeja de feedback
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
