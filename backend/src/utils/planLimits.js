// 💳 Límites reales por plan — la única fuente de verdad.
// Antes de esto, "Premium" era solo una etiqueta decorativa sin
// ninguna restricción activa: cualquier plan podía crear
// barberos ilimitados y ver todas las estadísticas.

const PLAN_LIMITS = {
  basico: {
    maxBarbers: 1,
    statsGranularity: ["month"], // solo el mes actual
    payrollBreakdown: false,     // desglose de ingresos por profesional
  },
  pro: {
    maxBarbers: 5,
    statsGranularity: ["day", "week", "month"],
    payrollBreakdown: false,
  },
  premium: {
    maxBarbers: Infinity,
    statsGranularity: ["day", "week", "month", "year"],
    payrollBreakdown: true,
  },
};

function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.basico;
}

module.exports = { PLAN_LIMITS, getPlanLimits };
