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
  const { open, close, interval, hasBreak, breakStart, breakEnd } = req.body;

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const openM = toMinutes(open);
  const closeM = toMinutes(close);

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
    config = await Config.create({
      open,
      close,
      interval,
      hasBreak: hasBreakBool,
      breakStart,
      breakEnd,
    });
  } else {
    config.open = open;
    config.close = close;
    config.interval = interval;
    config.hasBreak = hasBreakBool;
    config.breakStart = breakStart;
    config.breakEnd = breakEnd;

    await config.save();
  }

  res.json(config);
});

module.exports = router;