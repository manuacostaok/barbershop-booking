const express = require("express");
const router = express.Router();
const Config = require("../models/Config");

router.get("/", async (req, res) => {
  let config = await Config.findOne();

  if (!config) {
    config = await Config.create({
      open: "09:00",
      close: "21:00",
      interval: 30,
      hasBreak: false,
      breakStart: "13:00",
      breakEnd: "14:00",
    });
  }

  res.json(config);
});

router.put("/", async (req, res) => {
  try {
    const { open, close, interval, hasBreak, breakStart, breakEnd } = req.body;

    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const openM = toMinutes(open);
    const closeM = toMinutes(close);

    // 🔥 aseguramos boolean real
    const hasBreakBool = hasBreak === true || hasBreak === "true";

    if (openM >= closeM) {
      return res.status(400).json({
        message: "Horario inválido: apertura debe ser menor a cierre",
      });
    }

    if (hasBreakBool) {
      const bStart = toMinutes(breakStart);
      const bEnd = toMinutes(breakEnd);

      if (bStart >= bEnd || bStart < openM || bEnd > closeM) {
        return res.status(400).json({
          message: "Break inválido",
        });
      }
    }

    let config = await Config.findOne();

    if (!config) {
      config = new Config();
    }

    // 🔥 ASIGNAMOS TODO SIEMPRE
    config.open = open;
    config.close = close;
    config.interval = interval;
    config.hasBreak = hasBreakBool;

    // 🔥 SOLO seteamos break si está activo
    config.breakStart = hasBreakBool ? breakStart : null;
    config.breakEnd = hasBreakBool ? breakEnd : null;

    await config.save();

    res.json(config);

  } catch (err) {
    console.error("ERROR CONFIG:", err);
    res.status(500).json({ message: "Error guardando configuración" });
  }
});

module.exports = router;