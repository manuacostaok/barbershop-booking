const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");

router.post("/validate", async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ valid: false });
    }

    return res.json({
      valid: true,
      coupon
    });

  } catch (err) {
    res.status(500).json({ valid: false });
  }
});

module.exports = router;