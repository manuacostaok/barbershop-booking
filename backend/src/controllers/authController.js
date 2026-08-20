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
const Config = require("../models/Config");
const Appointment = require("../models/Appointment");

// ===============================
// 🔐 LOGIN
// ===============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Completá email y contraseña" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    // 🔒 Mensaje genérico: no revelamos si el usuario existe o no
    if (!user) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
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
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Completá todos los campos",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email: normalizedEmail,
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
// 🖼️ UPDATE BANNER
// ===============================
const updateBanner = async (req, res) => {
  try {
    const { banner } = req.body;

    if (!banner) {
      return res.status(400).json({
        message: "Banner requerido",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { banner },
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: "Error actualizando banner" });
  }
};

// ===============================
// 🎁 CANJEAR CORTE GRATIS
// ===============================

const redeemFreeCut = async (req, res) => {
  try {
    const { service } = req.body;

    if (!service) {
      return res.status(400).json({ message: "Falta el servicio" });
    }

    // 🔥 req.user viene del JWT decodificado -> { id, role, email }
    // (no tiene _id ni name, por eso buscamos el usuario real)
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 🔒 VALIDACIÓN REAL DE ELEGIBILIDAD — antes este endpoint creaba
    // el cupón sin chequear nada, cualquier cliente logueado podía
    // pedir cupones infinitos sin haberse cortado el pelo nunca.
    const config = await Config.findOne();

    if (!config?.loyaltyEnabled) {
      return res.status(400).json({ message: "El sistema de premios no está activo" });
    }

    const cutsNeeded = config.loyaltyCuts || 5;

    const completedCuts = await Appointment.countDocuments({
      status: "completed",
      service,
      $or: [
        { clientId: user._id },
        { clientEmail: { $regex: `^${user.email}$`, $options: "i" } },
      ],
    });

    const eligibleRewards = Math.floor(completedCuts / cutsNeeded);

    const alreadyRedeemed = await Coupon.countDocuments({
      userId: user._id,
      service,
    });

    if (alreadyRedeemed >= eligibleRewards) {
      return res.status(400).json({ message: "Todavía no llegaste a tu próximo premio" });
    }

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
  updateBanner,
  redeemFreeCut, 
  addHistory,
};