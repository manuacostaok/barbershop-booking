const { MercadoPagoConfig } = require("mercadopago");

// El SDK solo se inicializa si hay Access Token cargado — sin esto
// la app sigue funcionando con el checkout de demostración.
const mpClient = process.env.MP_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
  : null;

module.exports = { mpClient };
