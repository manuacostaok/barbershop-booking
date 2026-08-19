const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // 📸 opcional — si se carga, se muestra en miniatura al
  // elegir el servicio en la página de reservas
  image: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);