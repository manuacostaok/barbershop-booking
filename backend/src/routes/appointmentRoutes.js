const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAvailability,
} = require("../controllers/appointmentController");

const Appointment = require("../models/Appointment");


// ===============================
// 🔥 CREAR TURNO
// ===============================
router.post("/", createAppointment);


// ===============================
// 🔥 DISPONIBILIDAD POR FECHA + BARBERO
// ===============================
router.get("/availability", getAvailability);


// ===============================
// 🔥 PANEL ADMIN → TODOS LOS TURNOS
// ===============================
router.get("/all", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("barber", "name");

    res.json(appointments);

  } catch (error) {
    console.log("ERROR GET ALL:", error);

    res.status(500).json({
      message: "Error obteniendo turnos",
    });
  }
});


// ===============================
// 🔥 CANCELAR TURNO (DELETE HARD)
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Turno no encontrado",
      });
    }

    res.json({
      message: "Turno cancelado correctamente",
    });

  } catch (error) {
    console.log("ERROR DELETE:", error);

    res.status(500).json({
      message: "Error cancelando turno",
    });
  }
});


// ===============================
// 🔥 OPCIÓN PRO → CANCELAR POR STATUS
// (NO BORRA, MEJOR PARA NEGOCIO)
// ===============================
router.patch("/:id/cancel", async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Turno no encontrado",
      });
    }

    res.json(updated);

  } catch (error) {
    console.log("ERROR CANCEL STATUS:", error);

    res.status(500).json({
      message: "Error cancelando turno",
    });
  }
});


module.exports = router;