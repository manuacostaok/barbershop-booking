// Planes y precios ARS — única fuente de verdad en el backend
// (el frontend no debe decidir el precio, solo mostrarlo). Usado
// tanto para el lead capture público (/api/subscriptions) como
// para el cambio de plan de un cliente ya existente (/api/billing).
const PLANS = {
  basico: { label: "Básico", price: 19999 },
  pro: { label: "Pro", price: 32999 },
  premium: { label: "Premium", price: 54999 },
};

module.exports = { PLANS };
