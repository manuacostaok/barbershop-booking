const express = require("express");
const router = express.Router();
const Config = require("../models/Config");

// obtener config
router.get("/", async (req, res) => {
  let config = await Config.findOne();

  if (!config) {
    config = await Config.create({});
  }

  res.json(config);
});

// actualizar config
router.put("/", async (req, res) => {
  const { open, close, interval, hasBreak, breakStart, breakEnd } = req.body;

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const openM = toMinutes(open);
  const closeM = toMinutes(close);

  if (openM >= closeM) {
    return res.status(400).json({
      message: "Horario inválido: apertura debe ser menor a cierre",
    });
  }

  if (hasBreak) {
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
    config = await Config.create(req.body);
  } else {
    Object.assign(config, req.body);
    await config.save();
  }

  res.json(config);
});
module.exports = router;