import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔒 no logueado → home
  if (!token || !user) return <Navigate to="/" />;

  // 🔒 rol incorrecto → home
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}

export default ProtectedRoute;