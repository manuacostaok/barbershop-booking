const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAvailability,
  completeAppointment,
  cancelAppointment,
  reactivateAppointment,
  confirmAppointment,
  deleteAppointment
} = require("../controllers/appointmentController");

const Appointment = require("../models/Appointment");
const Config = require("../models/Config");
const { protect, requireRole, protectOptional } = require("../middlewares/authMiddleware");
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

// 🔒 Rate limit para evitar spam de reservas (bots llenando la agenda)
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Demasiados intentos de reserva. Probá de nuevo en unos minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// COMPLETE — solo el barbero dueño del turno o admin
router.patch("/:id/complete", protect, requireRole(["barber", "admin"]), completeAppointment);

// CREATE
router.post("/", bookingLimiter, protectOptional, async (req, res) => {
  try {
    const { time, barber, date } = req.body;

    if (!time || !barber || !date) {
      return res.status(400).json({ message: "Faltan datos del turno" });
    }

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


// ADMIN
router.get("/all", protect, requireRole("admin"), getAllAppointments);

// 🔒 Estas 4 acciones antes no requerían estar logueado. Ahora sí.
router.patch("/:id/cancel", protect, cancelAppointment); // ownership check adentro del controller
router.patch("/:id/reactivate", protect, requireRole(["barber", "admin"]), reactivateAppointment);
router.delete("/:id", protect, requireRole("admin"), deleteAppointment);
router.patch("/:id/confirm", protect, requireRole(["barber", "admin"]), confirmAppointment);


// AVAILABILITY
router.get("/availability", getAvailability);

// CLIENT y Barber
router.get("/my", protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "barber") {
      filter = { barber: req.user.id };
    }

    if (req.user.role === "client") {
      filter = {
        $or: [
          { clientId: req.user.id },
          { clientEmail: { $regex: `^${req.user.email}$`, $options: "i" } },
        ],
      };
    }

    if (req.user.role === "admin") {
      filter = {}; // ve todo
    }

    const appointments = await Appointment.find(filter)
      .populate("barber", "name")
      .sort({ date: -1 });

    res.json(appointments);

  } catch (err) {
    console.error("ERROR /my:", err);
    res.status(500).json({ message: "Error cargando turnos" });
  }
});

module.exports = router;
