const mongoose = require("mongoose");

const localSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Mi Barbería",
    },

    description: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    open: {
      type: String,
      default: "09:00",
    },

    close: {
      type: String,
      default: "22:00",
    },

    interval: {
      type: Number,
      default: 30,
    },

    instagram: {
      type: String,
      default: "",
    },

    // 🎨 Paleta de colores de la página pública — pensado para
    // que el mismo sistema sirva a rubros distintos (barbería,
    // manicura/estética, spa, etc.) sin que se vea "de barbero"
    // para todos.
    // 🎨 Apariencia de la página pública — dos ejes independientes:
    // paleta (color de marca) y modo (claro/oscuro). Cualquier
    // combinación es válida (ej: rosa+oscuro, esmeralda+claro).
    themePalette: {
      type: String,
      enum: ["esmeralda", "azul", "neutro", "rosa", "lavanda", "durazno"],
      default: "esmeralda",
    },
    themeMode: {
      type: String,
      enum: ["oscuro", "claro"],
      default: "oscuro",
    },

    // 📣 Anuncio/promo editable — lo carga el admin y se muestra
    // en el hero de la página pública, como el banner de registro
    // pero para lo que el admin quiera avisar (promos, feriados, etc).
    announcementEnabled: {
      type: Boolean,
      default: false,
    },
    announcementText: {
      type: String,
      default: "",
      maxlength: 200,
    },

    // 💳 Plan contratado — determina qué funciones están
    // habilitadas. Hasta ahora "Premium" era solo una etiqueta
    // decorativa en Estadísticas, sin ninguna restricción real
    // detrás. Esto lo hace cumplir de verdad.
    plan: {
      type: String,
      enum: ["basico", "pro", "premium"],
      default: "basico",
    },

    // 💳 Suscripción recurrente de Mercado Pago que paga el plan de
    // ARRIBA (no confundir con las suscripciones de /api/subscriptions,
    // que son leads de clientes nuevos sin instancia propia todavía).
    // Se completan solo desde /api/billing — nunca a mano.
    mpPreapprovalId: {
      type: String,
      default: null,
    },
    // Plan al que se pasa una vez que Mercado Pago confirme el pago
    // (alta nueva o cambio recién solicitado, todavía no confirmado).
    pendingPlan: {
      type: String,
      enum: ["basico", "pro", "premium", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Local", localSchema);