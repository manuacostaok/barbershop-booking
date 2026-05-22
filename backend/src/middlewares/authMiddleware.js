const jwt = require("jsonwebtoken");

// 🔐 PROTECT (auth)
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // 🔥 { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// 🔓 PROTECT OPCIONAL (puede venir sin login)
const protectOptional = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }

  next();
};

// 🛡️ ROLE CHECK
const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.user.role !== role) {
    return res.status(403).json({ message: "No permitido" });
  }

  next();
};

module.exports = {
  protect,
  requireRole,
  protectOptional,
};