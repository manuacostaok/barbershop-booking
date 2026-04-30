import { useState, useEffect } from "react";
import api from "../api";
import LoginForm from "../components/LoginForm.jsx";
import Toast from "../components/Toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

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

      setTimeout(() => {
        window.location.href = res.data.user.role === "admin" ? "/admin" : "/";
      }, 500);

    } catch (err) {
      setToast(err.response?.data?.message || "Error login");
    }

    setLoading(false);
  };

  return (
    <div className="login-card">
      <LoginForm
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        onSubmit={handleLogin}
        loading={loading}
      />

      <Toast
        message={toast}
        show={!!toast}
        onClose={() => setToast("")}
      />
    </div>
  );
}

export default Login;