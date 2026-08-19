require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitize = require("./middlewares/sanitize");
const connectDB = require("./config/db");

const app = express();
const isProd = process.env.NODE_ENV === "production";

const couponRoutes = require("./routes/couponRoutes");
const localRoutes = require("./routes/localRoutes");

// ===============================
// 🔌 DB
// ===============================
connectDB();

// ===============================
// 🛡️ SECURITY HEADERS
// ===============================
app.use(helmet());
app.disable("x-powered-by");

// ===============================
// 🌍 CORS
// ===============================
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ===============================
// 🧩 MIDDLEWARES
// ===============================
app.use(express.json({ limit: "4mb" }));

// 🔒 Anti NoSQL injection: elimina claves con $ o . del body/params/query
app.use(sanitize);

// 🔒 Rate limit general de la API (anti fuerza bruta / DoS básico)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// 🔒 Rate limit más estricto para login/registro
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Demasiados intentos. Probá de nuevo en unos minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// 🔥 LOG REQUESTS (solo en desarrollo)
if (!isProd) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ===============================
// 📌 RUTAS
// ===============================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/availability", require("./routes/availabilityRoutes"));
app.use("/api/config", require("./routes/configRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

app.use("/api/coupons", couponRoutes);

app.use("/api/local", localRoutes);


// ===============================
// 🧪 TEST
// ===============================
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// ===============================
// ❤️ HEALTHCHECK (para deploy)
// ===============================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ===============================
// ❌ 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// ===============================
// 💥 ERROR HANDLER GLOBAL
// ===============================
app.use((err, req, res, next) => {
  console.error("ERROR GLOBAL:", err);

  // 🔒 En producción no filtramos detalles internos del error
  res.status(err.status || 500).json({
    message: isProd ? "Error interno del servidor" : (err.message || "Error interno del servidor"),
  });
});

// ===============================
// 🚀 SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
