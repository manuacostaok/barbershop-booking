import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

import {
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserShield,
  FaUser
} from "react-icons/fa";

function Navbar() {
  const [modal, setModal] = useState(null);
  // "login" | "register" | null

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "admin";
  const isBarber = user?.role === "barber";
  const isClient = user?.role === "client";

  const isAdminPanel = location.pathname.startsWith("/admin");
  const isBarberPanel = location.pathname.startsWith("/barber");
  const isClientPanel = location.pathname.startsWith("/client");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleLoginClick = () => {
    if (!user) return setModal("login");

    if (user.role === "admin") navigate("/admin");
    if (user.role === "barber") navigate("/barber");
    if (user.role === "client") navigate("/client");
  };

  return (
    <>
      <header className="navbar-glass">
        <div className="navbar-inner">

          {/* LOGO */}
          <h1 className="logo" onClick={() => navigate("/")}>
            Barber Studio
          </h1>

          <div className="nav-right">

            {/* =========================
                USUARIO LOGUEADO
            ========================= */}
            {user ? (
              <>
                {/* PANEL ADMIN */}
                {!isAdminPanel && isAdmin && (
                  <button className="nav-btn" onClick={() => navigate("/admin")}>
                    <FaUserShield /> Admin
                  </button>
                )}

                {/* PANEL BARBER */}
                {!isBarberPanel && isBarber && (
                  <button className="nav-btn" onClick={() => navigate("/barber")}>
                    <FaUserShield /> Panel
                  </button>
                )}

                {/* PANEL CLIENTE */}
                {!isClientPanel && isClient && (
                  <button className="nav-btn" onClick={() => navigate("/client")}>
                    <FaUser /> Mi cuenta
                  </button>
                )}

                {/* HOME */}
                <button className="nav-btn" onClick={() => navigate("/")}>
                  <FaHome /> Inicio
                </button>

                {/* LOGOUT */}
                <button className="nav-btn danger" onClick={handleLogout}>
                  <FaSignOutAlt /> Salir
                </button>
              </>
            ) : (
              <>
                {/* NO LOGUEADO */}
                <button className="nav-btn" onClick={handleLoginClick}>
                  <FaSignInAlt /> Ingresar
                </button>
              </>
            )}

          </div>
        </div>
      </header>

      {/* LOGIN MODAL */}
      <LoginModal
        open={modal === "login"}
        onClose={() => setModal(null)}
        onSuccess={(user) => {
          setModal(null);

          if (user.role === "admin") navigate("/admin");
          if (user.role === "barber") navigate("/barber");
          if (user.role === "client") navigate("/client");
        }}
        onOpenRegister={() => setModal("register")}
      />

      {/* REGISTER MODAL */}
      <RegisterModal
        open={modal === "register"}
        onClose={() => setModal(null)}
        onSuccess={() => {
          setModal("login"); // vuelve al login
        }}
      />
    </>
  );
}

export default Navbar;