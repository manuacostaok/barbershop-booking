const express = require("express");
const router = express.Router();
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
// crear disponibilidad
router.post("/", async (req, res) => {
  try {
    const { barber, dayOfWeek, start, end } = req.body;

    const availability = await Availability.create({
      barber,
      dayOfWeek,
      start,
      end,
    });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// obtener disponibilidad por barbero
router.get("/:barberId", async (req, res) => {
  try {
    const data = await Availability.find({
      barber: req.params.barberId,
      isActive: true,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/availability", async (req, res) => {
  try {
    const { barber } = req.query;

    const config = await Availability.find({ barber });

    let start = "09:00";
    let end = "24:00";

    // si hay config, override (podés mejorar esto después)
    if (config.length > 0) {
      start = config[0].start;
      end = config[0].end;
    }

    const slots = generateSlots(start, end, 30);

    return res.json({
      available: slots,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;