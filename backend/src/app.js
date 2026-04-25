require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// 🔌 Conectar base de datos
connectDB();

// 🧩 Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));

// 📌 Rutas
const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);

// 🧪 Ruta test
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// 🚀 Levantar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});