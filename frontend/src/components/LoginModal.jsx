import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import api from "../api";
import BaseModal from "./BaseModal";
import LoginForm from "./LoginForm";
import Toast from "./Toast";
import { useLanguage } from "./LanguageContext";

function LoginModal({ open, onClose, onSuccess, onOpenRegister }) {
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

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

      setToast("Bienvenido 👋");

      setTimeout(() => {
        onSuccess?.(res.data.user);
        onClose();
      }, 300);

    } catch (err) {
      setToast(err.response?.data?.message || "Error login");
    }

    setLoading(false);
  };

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="modal-close" onClick={onClose}>
        <FaTimes />
      </div>

      <h2 className="modal-title">{t.login || "Iniciar sesión"}</h2>

      <LoginForm
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        onSubmit={handleLogin}
        loading={loading}
      />

      <p className="register-cta">
        ¿No tenés cuenta?{" "}
        <span className="link-register" onClick={() => onOpenRegister?.()}>
          Registrate
        </span>
      </p>

      <Toast message={toast} show={!!toast} onClose={() => setToast("")} />
    </BaseModal>
  );
}

export default LoginModal;
