const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

// ===============================
// 🔥 OBTENER BARBEROS
// ===============================
router.get("/barbers", async (req, res) => {
  try {
    const barbers = await User.find({ role: "barber" }).select("-password");
    res.json(barbers);
  } catch {
    res.status(500).json({ message: "Error obteniendo barberos" });
  }
});

// ===============================
// 🔒 CREAR BARBERO (SOLO ADMIN)
// ===============================
router.post("/barbers", authMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ message: "Ya existe ese usuario" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: "barber",
    });

    await user.save();

    res.json(user);

  } catch (error) {
    console.log("ERROR CREATE BARBER:", error);
    res.status(500).json({ message: "Error creando barbero" });
  }
});

// ===============================
// 🔥 EDITAR BARBERO
// ===============================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error actualizando barbero" });
  }
});

// ===============================
// 🔥 BORRAR BARBERO
// ===============================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    res.json({ message: "Barbero eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error eliminando barbero" });
  }
});


module.exports = router;