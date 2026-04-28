require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// 🔌 DB
connectDB();

// 🌍 CORS (IMPORTANTE para deploy)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// 🧩 Middlewares
app.use(express.json());

// ===============================
// 📌 RUTAS
// ===============================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));

// ===============================
// 🧪 TEST
// ===============================
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// ===============================
// ❌ 404 HANDLER (PRO)
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// ===============================
// 🚀 SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});