import { useState, useEffect } from "react";
import api from "../api";
import { motion } from "framer-motion";
import { FaLock, FaEnvelope } from "react-icons/fa";
import Toast from "../components/Toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 AUTO REDIRECT SI YA ESTÁ LOGUEADO
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user?.role === "admin") {
      window.location.href = "/admin";
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setToast("Completá todos los campos");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setToast("Login exitoso 🔐");

      setTimeout(() => {
        if (res.data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }, 600);

    } catch (err) {
      setToast(err.response?.data?.message || "Error login");
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="card login-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 🔥 TITLE */}
      <div className="title login-title">
        🔐 Admin Login
      </div>

      {/* 📧 EMAIL */}
      <div className="input-group">
        <FaEnvelope />
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* 🔒 PASSWORD */}
      <div className="input-group">
        <FaLock />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* 🚀 BUTTON */}
      <button className="button" onClick={handleLogin}>
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      {/* 🔥 TOAST */}
      <Toast
        message={toast}
        show={!!toast}
        onClose={() => setToast("")}
      />
    </motion.div>
  );
}

export default Login;