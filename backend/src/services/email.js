// ============================================================
// 📧 SERVICIO DE EMAIL — confirmaciones y cancelaciones de turno
//
// Usa SMTP genérico (funciona con Gmail, Brevo, SendGrid, etc.)
// vía variables de entorno. Si no están configuradas, el envío
// se saltea silenciosamente (solo un log) para que la app nunca
// se caiga por esto — así podés desarrollar/probar sin credenciales
// y activarlo recién cuando cargues las tuyas.
//
// Variables necesarias en backend/.env:
//   EMAIL_HOST=smtp.gmail.com
//   EMAIL_PORT=587
//   EMAIL_USER=tu_usuario@gmail.com
//   EMAIL_PASS=tu_contraseña_de_aplicación   (NO la contraseña normal)
//   EMAIL_FROM="TurnosIA <tu_usuario@gmail.com>"
// ============================================================

const nodemailer = require("nodemailer");

const isConfigured = () =>
  !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter = null;

function getTransporter() {
  if (!isConfigured()) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
}

async function sendMail({ to, subject, html }) {
  if (!to) return { skipped: true, reason: "sin destinatario" };

  const t = getTransporter();

  if (!t) {
    console.log(`📧 [email no configurado] Se omitió el envío a ${to}: "${subject}"`);
    return { skipped: true, reason: "email no configurado" };
  }

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("📧 Error enviando email:", err.message);
    return { sent: false, error: err.message };
  }
}

// ------------------------------------------------------------
// TEMPLATES
// ------------------------------------------------------------
const wrapTemplate = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eee;">
    <div style="background: linear-gradient(135deg, #21e6b0, #ff5f87); padding: 24px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">${title}</h1>
    </div>
    <div style="padding: 24px; color: #222;">
      ${bodyHtml}
    </div>
    <div style="padding: 16px 24px; background: #fafafa; text-align: center; font-size: 12px; color: #999;">
      Enviado por TurnosIA
    </div>
  </div>
`;

async function sendAppointmentConfirmation(appointment) {
  const { clientEmail, clientName, service, date, time, barberName } = appointment;

  const html = wrapTemplate(
    "¡Turno confirmado! ✅",
    `
      <p>Hola ${clientName || ""},</p>
      <p>Tu turno quedó reservado con estos datos:</p>
      <ul style="line-height: 1.8;">
        <li><strong>Servicio:</strong> ${service}</li>
        ${barberName ? `<li><strong>Profesional:</strong> ${barberName}</li>` : ""}
        <li><strong>Fecha:</strong> ${date}</li>
        <li><strong>Hora:</strong> ${time} hs</li>
      </ul>
      <p>Si necesitás cancelar o reprogramar, hacelo desde tu cuenta.</p>
    `
  );

  return sendMail({
    to: clientEmail,
    subject: "Turno confirmado",
    html,
  });
}

async function sendAppointmentCancellation(appointment) {
  const { clientEmail, clientName, service, date, time } = appointment;

  const html = wrapTemplate(
    "Turno cancelado",
    `
      <p>Hola ${clientName || ""},</p>
      <p>Te confirmamos que tu turno fue cancelado:</p>
      <ul style="line-height: 1.8;">
        <li><strong>Servicio:</strong> ${service}</li>
        <li><strong>Fecha:</strong> ${date}</li>
        <li><strong>Hora:</strong> ${time} hs</li>
      </ul>
      <p>Podés reservar un nuevo turno cuando quieras.</p>
    `
  );

  return sendMail({
    to: clientEmail,
    subject: "Turno cancelado",
    html,
  });
}

module.exports = {
  isConfigured,
  sendMail,
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
};
