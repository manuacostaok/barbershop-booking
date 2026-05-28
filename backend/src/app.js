require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const couponRoutes = require("./routes/couponRoutes");
const localRoutes = require("./routes/localRoutes");

// ===============================
// 🔌 DB
// ===============================
connectDB();

// ===============================
// 🌍 CORS (PRO)
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://turnosahora.vercel.app"
    ],
    credentials: true
  })
);

// ===============================
// 🧩 MIDDLEWARES
// ===============================
app.use(express.json());

// 🔥 LOG REQUESTS (DEBUG PRO)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ===============================
// 📌 RUTAS
// ===============================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/availability", require("./routes/availabilityRoutes"));
app.use("/api/config", require("./routes/configRoutes"));

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
// 💥 ERROR HANDLER GLOBAL (MUY PRO)
// ===============================
app.use((err, req, res, next) => {
  console.error("ERROR GLOBAL:", err);

  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

// ===============================
// 🚀 SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});