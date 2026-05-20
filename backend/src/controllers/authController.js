const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// 🔥 TOKEN
// ===============================
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

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
    const userId = req.user.id;
    const { service } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // contar cortes de ese servicio
    const cuts = user.appointmentsHistory.filter(
      (appt) => appt.service === service
    );

    if (cuts.length < 5) {
      return res.status(400).json({
        message: "No tenés suficientes cortes para canjear",
      });
    }

    // 🔥 eliminar los primeros 5 cortes usados
    let removed = 0;

    user.appointmentsHistory = user.appointmentsHistory.filter((appt) => {
      if (appt.service === service && removed < 5) {
        removed++;
        return false;
      }
      return true;
    });

    await user.save();

    res.json({
      message: "Corte gratis canjeado 🎉",
    });

  } catch (err) {
    res.status(500).json({
      message: "Error canjeando corte",
    });
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