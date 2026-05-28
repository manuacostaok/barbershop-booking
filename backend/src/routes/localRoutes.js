const express = require("express");
const router = express.Router();

const Local = require("../models/Local");


// 📌 GET LOCAL (si no existe, lo crea)
router.get("/", async (req, res) => {
  try {
    let local = await Local.findOne();

    if (!local) {
      local = await Local.create({});
    }

    res.json(local);
  } catch (err) {
    res.status(500).json({ message: "Error obteniendo local" });
  }
});


// 📌 UPDATE LOCAL
router.put("/", async (req, res) => {
  try {
    let local = await Local.findOne();

    if (!local) {
      local = await Local.create(req.body);
    } else {
      local = await Local.findByIdAndUpdate(local._id, req.body, {
        new: true,
      });
    }

    res.json(local);
  } catch (err) {
    res.status(500).json({ message: "Error actualizando local" });
  }
});

module.exports = router;