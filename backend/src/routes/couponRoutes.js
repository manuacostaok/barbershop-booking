const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { protect, requireRole } = require("../middlewares/authMiddleware"); // 🔥 FALTABA ESTO

// 🔒 Solo barbero/admin pueden validar y canjear cupones — antes
// cualquier cliente logueado podía canjear cupones ajenos (o el
// propio) sin que un barbero lo confirme en persona. Además el
// populate traía el usuario completo, hash de contraseña incluido.
router.post("/validate", protect, requireRole(["barber", "admin"]), async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code }).populate("userId", "name");

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