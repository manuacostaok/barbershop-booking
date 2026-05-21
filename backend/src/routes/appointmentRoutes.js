const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAvailability,
  completeAppointment
} = require("../controllers/appointmentController");

const Appointment = require("../models/Appointment");
const Config = require("../models/Config");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const generateSlots = require("../utils/generateSlots");

// helpers
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

// COMPLETE
router.patch("/:id/complete", protect, completeAppointment);

// CREATE
router.post("/", async (req, res) => {
  try {
    const { time, barber, date } = req.body;

    const config = await Config.findOne();

    if (isInBreak(time, config)) {
      return res.status(400).json({ message: "No se pueden turnos en break" });
    }

    const exists = await Appointment.findOne({
      barber,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    if (exists) {
      return res.status(400).json({ message: "Horario ocupado" });
    }

    await createAppointment(req, res);

  } catch (err) {
    res.status(500).json({ message: "Error creando turno" });
  }
});

// BARBER
router.get("/my", protect, getMyAppointments);

// ADMIN
router.get("/all", protect, requireRole("admin"), getAllAppointments);

// AVAILABILITY
router.get("/availability", getAvailability);

// CLIENT FIX 🔥
router.get("/my", protect, async (req, res) => {
  try {
    let filter = {};

    // 🔥 si es barbero → ve sus turnos
    if (req.user.role === "barber") {
      filter = { barber: req.user.id };
    }

    // 🔥 si es cliente → ve SUS turnos
    if (req.user.role === "client") {
      filter = {
        $or: [
          { clientId: req.user.id },       // 👈 turnos logueado
          { clientEmail: req.user.email }, // 👈 turnos invitados
        ],
      };
    }

    const appointments = await Appointment.find(filter)
      .populate("barber", "name")
      .sort({ date: -1 });

    res.json(appointments);

  } catch (err) {
    res.status(500).json({ message: "Error cargando turnos" });
  }
});

module.exports = router;