const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect, requireRole } = require("../middlewares/authMiddleware");
// 🔥 CREAR CORTE (ADMIN)
router.post("/", protect, requireRole("admin"), async (req, res) => {
  try {
    const { name, price, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const service = new Service({ name, price, image: image || "" });
    await service.save();

    res.json(service);

  } catch (err) {
    res.status(500).json({ message: "Error creando corte" });
  }
});

// 📸 ACTUALIZAR IMAGEN (ADMIN) — separado para no tener que
// reenviar nombre/precio solo para cambiar la foto
router.put("/:id/image", protect, requireRole("admin"), async (req, res) => {
  try {
    const { image } = req.body;

    if (typeof image !== "string") {
      return res.status(400).json({ message: "Imagen inválida" });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { image },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Error actualizando imagen" });
  }
});

// 🔥 OBTENER TODOS (PUBLICO)
router.get("/", async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: "Servicio eliminado" });
});

module.exports = router;