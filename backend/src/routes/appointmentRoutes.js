const express = require("express");
const router = express.Router();

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

// COMPLETE
router.patch("/:id/complete", protect, completeAppointment);

// CREATE
  router.post("/", protectOptional, async (req, res) => {
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


// ADMIN
router.get("/all", protect, requireRole("admin"), getAllAppointments);

router.patch("/:id/cancel", cancelAppointment);
router.patch("/:id/reactivate", reactivateAppointment);
router.delete("/:id", deleteAppointment);

router.patch("/:id/confirm", confirmAppointment);


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
    console.log("ERROR /my:", err);
    res.status(500).json({ message: "Error cargando turnos" });
  }
});

module.exports = router;