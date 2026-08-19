const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const Review = require("../models/Review");
const { protect, requireRole } = require("../middlewares/authMiddleware");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// ===============================
// ⭐ CREAR RESEÑA (cliente logueado)
// ===============================
router.post("/", protect, limiter, async (req, res) => {
  try {
    const { barber, appointment, rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "La calificación debe ser entre 1 y 5" });
    }

    // 🔒 4-5 estrellas = pública. 1-3 estrellas = feedback interno,
    // nunca se muestra en la página pública.
    const isPublic = numericRating >= 4;

    const review = await Review.create({
      clientId: req.user.id,
      clientName: req.user.name || "Cliente",
      barber: barber || undefined,
      appointment: appointment || undefined,
      rating: numericRating,
      comment: (comment || "").slice(0, 500),
      isPublic,
    });

    res.status(201).json({
      message: isPublic
        ? "¡Gracias por tu reseña!"
        : "Gracias por tu comentario, lo tomamos en cuenta para mejorar",
      isPublic,
      review,
    });
  } catch (err) {
    console.error("ERROR CREATE REVIEW:", err);
    res.status(500).json({ message: "Error guardando la reseña" });
  }
});

// ===============================
// 🌟 RESEÑAS PÚBLICAS (home) — solo positivas
// ===============================
router.get("/public", async (req, res) => {
  try {
    const { barber } = req.query;

    const filter = { isPublic: true };
    if (barber) filter.barber = barber;

    const reviews = await Review.find(filter)
      .populate("barber", "name avatar")
      .sort({ createdAt: -1 })
      .limit(30)
      .select("-clientId");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error cargando reseñas" });
  }
});

// ===============================
// 📋 FEEDBACK NEGATIVO (solo admin)
// ===============================
router.get("/feedback", protect, requireRole("admin"), async (req, res) => {
  try {
    const reviews = await Review.find({ isPublic: false })
      .populate("barber", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error cargando feedback" });
  }
});

router.patch("/:id/read", protect, requireRole("admin"), async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!review) return res.status(404).json({ message: "No encontrada" });

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Error actualizando feedback" });
  }
});

module.exports = router;
