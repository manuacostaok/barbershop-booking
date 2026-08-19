// ============================================================
// 👑 CREAR EL PRIMER ADMIN de una barbería nueva.
//
// El registro público (/auth/register) siempre crea usuarios con
// rol "client" a propósito (por seguridad — nadie debería poder
// auto-asignarse admin desde el formulario público). Por eso,
// cada vez que desplegás una instancia nueva para un cliente,
// corrés este script UNA vez para crear su primer usuario admin.
//
// Uso (parado en la carpeta backend/, con el .env de ESE cliente
// ya cargado):
//
//   node src/scripts/createAdmin.js "Nombre" email@negocio.com contraseñaSegura123
//
// Si ya existe un admin en esa base, el script no crea uno nuevo
// (para evitar duplicados por error) — a menos que le pases --force.
// ============================================================

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--force");
  const force = process.argv.includes("--force");

  const [name, email, password, phone] = args;

  if (!name || !email || !password) {
    console.log(
      "Uso: node src/scripts/createAdmin.js \"Nombre\" email@negocio.com contraseñaSegura [telefono] [--force]"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.log("❌ La contraseña debe tener al menos 8 caracteres");
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.log("❌ Falta MONGO_URI en el .env de este proyecto");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existingAdmin = await User.findOne({ role: "admin" });

  if (existingAdmin && !force) {
    console.log(
      `⚠️  Ya existe un admin en esta base (${existingAdmin.email}). Si igual querés crear otro, agregá --force al final.`
    );
    await mongoose.disconnect();
    process.exit(0);
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const already = await User.findOne({ email: normalizedEmail });

  if (already) {
    console.log(`❌ Ya existe un usuario con ese email (rol actual: ${already.role})`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await User.create({
    name,
    email: normalizedEmail,
    password: hashed,
    phone: phone || "",
    role: "admin",
  });

  console.log(`✅ Admin creado: ${admin.email} (${admin._id})`);
  console.log("Ya puede iniciar sesión normalmente desde /admin");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error creando admin:", err.message);
  process.exit(1);
});
