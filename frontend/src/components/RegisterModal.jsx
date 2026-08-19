import { useState } from "react";
import BaseModal from "./BaseModal";
import api from "../api";
import Toast from "./Toast";
import { FaLock, FaEnvelope, FaPhone, FaPencilAlt, FaTimes } from "react-icons/fa";

function RegisterModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState("");

const handleRegister = async () => {
  if (!name || !email || !phone || !password) {
    return setToast("Completá todos los campos");
  }

  try {
    const res = await api.post("/auth/register", {
      name,
      email,
      phone,
      password,
    });

    // 🔥 AUTO LOGIN
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setToast("Bienvenido 👋");

    setTimeout(() => {
      onSuccess?.(); // 🔥 cerrar modal / redirigir
    }, 500);

  } catch (err) {
    setToast(err.response?.data?.message || "Error");
  }
};

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="modal-close" onClick={onClose}>
        <FaTimes />
      </div>

      <h2 className="modal-title">Registrarse</h2>

    <div className="login-field">
        <FaPencilAlt className="login-icon" />
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
    
    <div className="login-field">
        <FaEnvelope className="login-icon" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

    <div className="login-field">
        <FaPhone className="login-icon" />
        <input
          type="tel"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

    <div className="login-field">
        <FaLock className="login-icon" />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="login-button" onClick={handleRegister}>
        Crear cuenta 🚀
      </button>

      <Toast message={toast} show={!!toast} onClose={() => setToast("")} />
    </BaseModal>
  );
}

export default RegisterModal;