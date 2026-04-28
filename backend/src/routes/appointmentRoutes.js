const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAvailability,
} = require("../controllers/appointmentController");

const Appointment = require("../models/Appointment");
const authMiddleware = require("../middlewares/authMiddleware");

// ===============================
// 🔥 CREAR TURNO (PÚBLICO)
// ===============================
router.post("/", createAppointment);

// ===============================
// 🔥 DISPONIBILIDAD (PÚBLICO)
// ===============================
router.get("/availability", getAvailability);

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