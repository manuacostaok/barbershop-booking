const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { protect, requireRole } = require("../middlewares/authMiddleware");

// ===============================
// 🔥 OBTENER BARBEROS (público, sin datos sensibles)
// ===============================
router.get("/barbers", async (req, res) => {
  try {
    const barbers = await User.find({ role: "barber" }).select(
      "-password -email -phone -appointmentsHistory"
    );
    res.json(barbers);
  } catch {
    res.status(500).json({ message: "Error obteniendo barberos" });
  }
});

// ===============================
// 🔒 CREAR BARBERO (SOLO ADMIN)
// ===============================
router.post("/barbers", protect, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });

    if (exists) {
      return res.status(400).json({ message: "Ya existe ese usuario" });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashed,
      phone,
      role: "barber",
    });

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json(safeUser);

  } catch (error) {
    console.error("ERROR CREATE BARBER:", error);
    res.status(500).json({ message: "Error creando barbero" });
  }
});

// ===============================
// 🔒 EDITAR BARBERO (SOLO ADMIN)
// ===============================
router.put("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    // 🔥 Solo permitimos actualizar estos campos (nunca role, password ni points directo)
    const { name, email, phone } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Barbero no encontrado" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error actualizando barbero" });
  }
});

// ===============================
// 🔒 BORRAR BARBERO (SOLO ADMIN)
// ===============================
router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
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
