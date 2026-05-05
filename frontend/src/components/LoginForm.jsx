import { FaLock, FaEnvelope } from "react-icons/fa";

function LoginForm({ email, password, setEmail, setPassword, onSubmit, loading }) {
  return (
    <>
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
        <FaLock className="login-icon" />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="login-button" onClick={onSubmit}>
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </>
  );
}

export default LoginForm;