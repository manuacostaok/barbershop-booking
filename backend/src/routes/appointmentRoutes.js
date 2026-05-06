const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAvailability,
} = require("../controllers/appointmentController");

const Appointment = require("../models/Appointment");
const authMiddleware = require("../middlewares/authMiddleware");


const Config = require("../models/Config");
const generateSlots = require("../utils/generateSlots");


// ===============================
// 🔥 CREAR TURNO (PÚBLICO)
// ===============================
router.post("/", createAppointment);

// ===============================
// 🔥 DISPONIBILIDAD (PÚBLICO)
// ===============================
// routes/appointments.js
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


router.get("/availability", async (req, res) => {
  try {
    const { date, barber } = req.query;

    const config = await Config.findOne();

    const open = config?.open || "09:00";
    const close = config?.close || "22:00";
    const interval = config?.interval || 30;

    // 1. generar slots base
    let slots = generateSlots(open, close, interval);

    // 2. aplicar break si existe
    if (config?.hasBreak) {
      slots = slots.filter(slot => {
        return !(slot >= config.breakStart && slot < config.breakEnd);
      });
    }

    // 3. buscar turnos ocupados REALES
    const appointments = await Appointment.find({
      barber,
      date,
      status: { $ne: "cancelled" }
    });

    const booked = appointments.map(a => a.time);

    // 4. filtrar disponibles
    const available = slots.filter(s => !booked.includes(s));

    res.json({ available });

  } catch (err) {
    console.log("ERROR AVAILABILITY:", err);
    res.status(500).json({ message: err.message });
  }
});
// ===============================
// 🔒 ADMIN → TODOS LOS TURNOS
// ===============================
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("barber", "name");

    res.json(appointments);

  } catch (error) {
    console.log("ERROR GET ALL:", error);
    res.status(500).json({ message: "Error obteniendo turnos" });
  }
});

// ===============================
// 🔒 STATS
// ===============================
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find();

    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === "confirmed").length;
    const income = confirmed * 5000;

    res.json({ total, confirmed, income });

  } catch {
    res.status(500).json({ message: "Error stats" });
  }
});

// ===============================
// 🔒 CANCELAR
// ===============================
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    res.json(updated);

  } catch (error) {
    console.log("ERROR CANCEL:", error);
    res.status(500).json({ message: "Error cancelando turno" });
  }
});

// ===============================
// 🔒 REACTIVAR
// ===============================
router.patch("/:id/reactivate", authMiddleware, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "pending" },
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    console.log("ERROR REACTIVATE:", error);
    res.status(500).json({ message: "Error reactivando turno" });
  }
});

// ===============================
// 🔒 DELETE
// ===============================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    res.json({ message: "Turno eliminado correctamente" });

  } catch (error) {
    console.log("ERROR DELETE:", error);
    res.status(500).json({ message: "Error eliminando turno" });
  }
});

module.exports = router;