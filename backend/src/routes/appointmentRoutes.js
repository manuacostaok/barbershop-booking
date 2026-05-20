const express = require("express");
const router = express.Router();

const {
  createAppointment,
} = require("../controllers/appointmentController");

const Appointment = require("../models/Appointment");

// ✅ FIX IMPORT
const { protect, requireRole } = require("../middlewares/authMiddleware");
const Config = require("../models/Config");
const generateSlots = require("../utils/generateSlots");




// ===============================
// 🔥 HELPERS (TIEMPO)
// ===============================
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const isInBreak = (time, config) => {
  if (!config?.hasBreak) return false;

  const t = toMinutes(time);
  const bStart = toMinutes(config.breakStart);
  const bEnd = toMinutes(config.breakEnd);

  return t >= bStart && t < bEnd;
};

const { completeAppointment } = require("../controllers/appointmentController");

router.patch("/:id/complete", protect, completeAppointment);


// ===============================
// 🔥 CREAR TURNO (PÚBLICO)
// ===============================
router.post("/", async (req, res) => {
  try {
    const { time, barber, date } = req.body;

    const config = await Config.findOne();

    // ❌ BLOQUEO BREAK
    if (isInBreak(time, config)) {
      return res.status(400).json({
        message: "No se pueden sacar turnos en el break",
      });
    }

    // ❌ BLOQUEO DUPLICADOS
    const exists = await Appointment.findOne({
      barber,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    if (exists) {
      return res.status(400).json({
        message: "Ese horario ya está ocupado",
      });
    }

    // ✅ CREACIÓN REAL
    await createAppointment(req, res);

  } catch (err) {
    console.log("ERROR CREATE:", err);
    res.status(500).json({ message: "Error creando turno" });
  }
});


// ===============================
// 🔥 BARBER → VER SUS TURNOS (PRO)
// ===============================
router.get("/my", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      barber: req.user.id,
    }).sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error obteniendo turnos del barbero" });
  }
});


// ===============================
// 🔥 VER TURNOS DE UN BARBERO
// ===============================
router.get("/barber/:barberId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      barber: req.params.barberId,
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// 🔥 DISPONIBILIDAD (BOOKING)
// ===============================
router.get("/availability", async (req, res) => {
  try {
    const { date, barber } = req.query;

    const config = await Config.findOne();

    const open = config?.open || "09:00";
    const close = config?.close || "22:00";
    const interval = config?.interval || 30;

    // 1. slots base
    let slots = generateSlots(open, close, interval);

    // 2. FILTRO BREAK
    if (config?.hasBreak) {
      const breakStart = toMinutes(config.breakStart);
      const breakEnd = toMinutes(config.breakEnd);

      slots = slots.filter((slot) => {
        const t = toMinutes(slot);
        return !(t >= breakStart && t < breakEnd);
      });
    }

    // 3. TURNOS OCUPADOS
    const appointments = await Appointment.find({
      barber,
      date,
      status: { $ne: "cancelled" },
    });

    const booked = appointments.map((a) => a.time);

    // 4. DISPONIBLES
    const available = slots.filter((s) => !booked.includes(s));

    res.json({ available });

  } catch (err) {
    console.log("ERROR AVAILABILITY:", err);
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// 🔒 ADMIN → TODOS LOS TURNOS
// ===============================
router.get("/all", protect, requireRole("admin"), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("barber", "name");

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: "Error obteniendo turnos" });
  }
});


// ===============================
// 🔒 STATS
// ===============================
router.get("/stats", protect, requireRole("admin"), async (req, res) => {
  try {
    const appointments = await Appointment.find();

    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === "confirmed").length;

    // ⚠️ después lo hacemos dinámico con precio real
    const income = confirmed * 5000;

    res.json({ total, confirmed, income });

  } catch {
    res.status(500).json({ message: "Error stats" });
  }
});


// ===============================
// 🔒 CANCEL
// ===============================
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: "Error cancelando turno" });
  }
});


// ===============================
// 🔒 REACTIVATE
// ===============================
router.patch("/:id/reactivate", protect, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "pending" },
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: "Error reactivando turno" });
  }
});


// ===============================
// 🔒 DELETE
// ===============================
router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: "Turno eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ message: "Error eliminando turno" });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      client: req.user.id
    }).sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error cargando turnos" });
  }
});

module.exports = router;