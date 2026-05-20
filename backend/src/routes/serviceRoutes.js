const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect, requireRole } = require("../middlewares/authMiddleware");
// 🔥 CREAR CORTE (ADMIN)
router.post("/", protect, requireRole("admin"), async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const service = new Service({ name, price });
    await service.save();

    res.json(service);

  } catch (err) {
    res.status(500).json({ message: "Error creando corte" });
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