// ============================================================
// 💬 SERVICIO DE WHATSAPP — recordatorios de turno (plan Premium)
//
// ⚠️ A DIFERENCIA DEL EMAIL, ESTO TIENE COSTO POR MENSAJE.
// No existe forma de mandar WhatsApp gratis mediante un
// proveedor genérico — hace falta sí o sí una cuenta de:
//   - Twilio (WhatsApp Business API), o
//   - Meta Cloud API (WhatsApp Business Platform, directo de Meta)
//
// Ambos cobran por mensaje enviado (aprox. unos centavos de
// dólar por conversación en Argentina, varía por proveedor y
// tipo de mensaje). Por eso este costo tiene que trasladarse
// al precio del plan Premium o facturarse aparte por uso —
// NO se puede ofrecer "ilimitado" a un precio fijo sin arriesgar
// pérdida si un negocio manda muchos turnos por mes.
//
// Variables necesarias en backend/.env (Twilio, ejemplo):
//   WHATSAPP_PROVIDER=twilio
//   TWILIO_ACCOUNT_SID=xxxx
//   TWILIO_AUTH_TOKEN=xxxx
//   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
//
// Mientras no estén configuradas, esto no hace nada (solo loguea)
// así el resto de la app funciona sin romperse.
// ============================================================

const isConfigured = () =>
  !!(
    process.env.WHATSAPP_PROVIDER === "twilio" &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM
  );

async function sendWhatsAppReminder({ to, message }) {
  if (!to) return { skipped: true, reason: "sin teléfono" };

  if (!isConfigured()) {
    console.log(`💬 [WhatsApp no configurado] Se omitió el mensaje a ${to}: "${message}"`);
    return { skipped: true, reason: "whatsapp no configurado" };
  }

  // =====================================================
  // 🔥 TODO — INTEGRACIÓN REAL CON TWILIO
  // Cuando tengas la cuenta de Twilio con WhatsApp habilitado:
  //
  // const twilio = require("twilio");
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  //
  // await client.messages.create({
  //   from: process.env.TWILIO_WHATSAPP_FROM,
  //   to: `whatsapp:${to}`,
  //   body: message,
  // });
  //
  // Cada llamada acá factura un mensaje — por eso conviene
  // guardar un contador mensual por negocio (para cobrar el
  // excedente o cortar el envío si se pasó del cupo del plan).
  // =====================================================

  return { skipped: true, reason: "integración pendiente de credenciales" };
}

async function sendAppointmentReminder(appointment) {
  const { clientPhone, service, date, time } = appointment;

  return sendWhatsAppReminder({
    to: clientPhone,
    message: `Hola! Te recordamos tu turno de ${service} el ${date} a las ${time} hs. Te esperamos 💈`,
  });
}

module.exports = {
  isConfigured,
  sendWhatsAppReminder,
  sendAppointmentReminder,
};
