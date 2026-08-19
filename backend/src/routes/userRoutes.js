const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Local = require("../models/Local");
const { getPlanLimits } = require("../utils/planLimits");
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

    // 💳 Límite real por plan — antes cualquiera podía crear
    // barberos sin tope, sin importar el plan contratado.
    const local = await Local.findOne();
    const { maxBarbers } = getPlanLimits(local?.plan);

    const currentBarberCount = await User.countDocuments({ role: "barber" });

    if (currentBarberCount >= maxBarbers) {
      return res.status(403).json({
        message: `Tu plan actual (${local?.plan || "básico"}) permite hasta ${maxBarbers} profesional${maxBarbers === 1 ? "" : "es"}. Actualizá tu plan para agregar más.`,
      });
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
    const { name, email, phone, schedule } = req.body;

    const update = { name, email, phone };

    // 🗓️ validamos schedule si vino (7 entradas, días 0-6, sin duplicados)
    if (schedule !== undefined) {
      if (!Array.isArray(schedule)) {
        return res.status(400).json({ message: "Formato de horario inválido" });
      }

      const seenDays = new Set();
      for (const entry of schedule) {
        const day = Number(entry.dayOfWeek);
        if (isNaN(day) || day < 0 || day > 6 || seenDays.has(day)) {
          return res.status(400).json({ message: "Días de horario inválidos" });
        }
        seenDays.add(day);
      }

      update.schedule = schedule.map((e) => ({
        dayOfWeek: Number(e.dayOfWeek),
        active: !!e.active,
        start: e.start || "09:00",
        end: e.end || "18:00",
      }));
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      update,
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
