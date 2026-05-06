const express = require("express");
const router = express.Router();
const Availability = require("../models/Availability");

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

module.exports = router;