const express = require("express");
const router = express.Router();

const {
  login,
  register,
  updateAvatar,
  updateBanner,
  getMe,
  redeemFreeCut,
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");

// 🔐 AUTH
router.post("/register", register);
router.post("/login", login);
router.post("/redeem", protect, redeemFreeCut);


// 🔥 NUEVOS (PRO)
router.get("/me", protect, getMe);        // obtener usuario actual
router.put("/avatar", protect, updateAvatar); // cambiar avatar
router.put("/banner", protect, updateBanner); // cambiar banner

module.exports = router;