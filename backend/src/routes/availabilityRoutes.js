const express = require("express");
const router = express.Router();

const Config = require("../models/Config");
const Appointment = require("../models/Appointment");
const generateSlots = require("../utils/generateSlots");


// ===============================
// 🔥 OBTENER HORARIOS DISPONIBLES (LOCAL)
// ===============================
router.get("/availability", async (req, res) => {
  try {
    const config = await Config.findOne();

    const open = config?.open || "09:00";
    const close = config?.close || "22:00";
    const interval = config?.interval || 30;

    let slots = generateSlots(open, close, interval);

    // ===============================
    // 🔥 OCUPADOS (EXCLUIR TURNOS YA RESERVADOS)
    // ===============================
    const appointments = await Appointment.find();

    const bookedTimes = appointments.map((a) => a.time);

    slots = slots.filter((slot) => !bookedTimes.includes(slot));

    return res.json({
      available: slots,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
