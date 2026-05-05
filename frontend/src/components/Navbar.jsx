import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import { useLanguage } from "../components/LanguageContext";

import {
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserShield
} from "react-icons/fa";

function Navbar() {
  const { lang, toggleLang } = useLanguage();
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const isAdminPanel = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleAdminClick = () => {
    if (isAdmin) navigate("/admin");
    else setShowLogin(true);
  };

  return (
    <>
      <header className="navbar-glass">
        <div className="navbar-inner">

          {/* LOGO */}
          <h1 className="logo">Barber Studio</h1>

          <div className="nav-right">

            {/* =========================
                ADMIN LOGUEADO
            ========================= */}
            {isAdmin ? (
              <>
                {!isAdminPanel && (
                  <button className="nav-btn" onClick={() => navigate("/admin")}>
                    <FaUserShield /> Admin
                  </button>
                )}

                <button className="nav-btn" onClick={() => navigate("/")}>
                  <FaHome /> Inicio
                </button>

                <button className="nav-btn danger" onClick={handleLogout}>
                  <FaSignOutAlt /> Salir
                </button>
              </>
            ) : (
              <>
                {/* NO LOGUEADO */}
                <button className="nav-btn" onClick={handleAdminClick}>
                  <FaSignInAlt /> Admin
                </button>
              </>
            )}

            {/* =========================
                IDIOMA SIEMPRE
            ========================= */}
            <button className="lang-btn" onClick={toggleLang}>
              {lang === "es" ? "EN 🇺🇸" : "ES 🇦🇷"}
            </button>

          </div>
        </div>
      </header>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          navigate("/admin");
        }}
      />
    </>
  );
}

export default Navbar;