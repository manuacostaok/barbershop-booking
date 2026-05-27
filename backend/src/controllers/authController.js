const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// 🔥 TOKEN
// ===============================
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
const Coupon = require("../models/Coupon");

// ===============================
// 🔐 LOGIN
// ===============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = generateToken(user);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      points: user.points,
    };

    res.json({ token, user: safeUser });

  } catch (err) {
    res.status(500).json({ message: "Error login" });
  }
};

// ===============================
// 🧾 REGISTER (CLIENTE)
// ===============================
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Completá todos los campos",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "client", // 🔥 SIEMPRE CLIENTE
    });

    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        points: user.points,
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Error creando usuario" });
  }
};

// ===============================
// 👤 GET ME
// ===============================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("appointmentsHistory.barber", "name");

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: "Error obteniendo usuario" });
  }
};

// ===============================
// 🖼️ UPDATE AVATAR
// ===============================
const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        message: "Avatar requerido",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: "Error actualizando avatar" });
  }
};

// ===============================
// 🎁 CANJEAR CORTE GRATIS
// ===============================

const redeemFreeCut = async (req, res) => {
  try {
    const user = req.user;
    const { service } = req.body;

    // 🔥 GENERAR CÓDIGO ÚNICO
    const code =
      "CUT-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 🔥 GUARDAR CUPÓN
    const newCoupon = await Coupon.create({
      userId: user._id,
      service,
      code,
      usedAt: new Date(),
    });

    // 🔥 CONTAR CUÁNTOS USÓ
    const totalUsed = await Coupon.countDocuments({
      userId: user._id,
    });

    res.json({
      success: true,
      coupon: {
        code,
        service,
        usedAt: newCoupon.usedAt,
        user: user.name,
        totalUsed,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error redeem" });
  }
};

// ===============================
// 📜 AGREGAR HISTORIAL
// ===============================
const addHistory = async (userId, data) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: { appointmentsHistory: data }
    });
  } catch (err) {
    console.log("Error guardando historial:", err);
  }
};

// ===============================
module.exports = {
  login,
  register,
  getMe,
  updateAvatar,
  redeemFreeCut, 
  addHistory,
};