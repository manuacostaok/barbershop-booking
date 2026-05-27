const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { protect } = require("../middlewares/authMiddleware"); // 🔥 FALTABA ESTO

router.post("/validate", protect, async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code }).populate("userId");

    // ❌ No existe
    if (!coupon) {
      return res.json({ valid: false, message: "No existe" });
    }

    // ❌ Ya usado
    if (coupon.redeemed) {
      return res.json({
        valid: false,
        message: "Cupón ya utilizado",
        coupon
      });
    }

    // ❌ Expirado
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.json({
        valid: false,
        message: "Cupón expirado",
      });
    }

    // ✅ MARCAR COMO USADO
    coupon.redeemed = true;
    coupon.redeemedAt = new Date();
    coupon.redeemedBy = req.user.id; // 🔥 tu middleware usa "id"

    await coupon.save();

    return res.json({
      valid: true,
      message: "Cupón válido y aplicado",
      coupon
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ valid: false });
  }
});

module.exports = router;