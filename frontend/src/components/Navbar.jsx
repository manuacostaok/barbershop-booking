import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

import {
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserShield,
  FaUser,
  FaBars,
  FaEye,
  FaCalendarCheck,
} from "react-icons/fa";

function Navbar() {
  const [modal, setModal] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "admin";
  const isBarber = user?.role === "barber";
  const isClient = user?.role === "client";

  const isHome = location.pathname === "/";
  const isAdminPanel = location.pathname.startsWith("/admin");
  const isBarberPanel = location.pathname.startsWith("/barber");
  const isClientPanel = location.pathname.startsWith("/client");
  const isInsidePanel = isAdminPanel || isBarberPanel || isClientPanel;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const btnClass = (active) => `nav-btn ${active ? "active" : ""}`;

  // Dentro de un panel (admin/barbero/cliente) el Sidebar ya
  // resuelve toda la navegación interna — acá solo hace falta
  // una forma rápida de ver la página pública (para chequear
  // cambios de perfil del local) y salir. Son pocos links
  // (2-3 como mucho), así que se muestran directo, sin
  // esconderlos detrás de un menú hamburguesa.
  const navLinks = isInsidePanel ? (
    <>
      <button className={btnClass(false)} onClick={() => navigate("/")}>
        <FaEye /> Ver mi página
      </button>

      <button className="nav-btn danger" onClick={handleLogout}>
        <FaSignOutAlt /> Salir
      </button>
    </>
  ) : (
    <>
      {!isHome && (
        <button className={btnClass(false)} onClick={() => navigate("/")}>
          <FaHome /> Inicio
        </button>
      )}

      {location.pathname !== "/planes" && (
        <button className={btnClass(false)} onClick={() => navigate("/planes")}>
          <FaCalendarCheck /> Planes
        </button>
      )}

      {user ? (
        <>
          {isAdmin && (
            <button className={btnClass(false)} onClick={() => navigate("/admin")}>
              <FaUserShield /> Admin
            </button>
          )}

          {isBarber && (
            <button className={btnClass(false)} onClick={() => navigate("/barber")}>
              <FaUserShield /> Panel
            </button>
          )}

          {isClient && (
            <button className={btnClass(false)} onClick={() => navigate("/client")}>
              <FaUser /> Mi cuenta
            </button>
          )}

          <button className="nav-btn danger" onClick={handleLogout}>
            <FaSignOutAlt /> Salir
          </button>
        </>
      ) : (
        <button className="nav-btn primary" onClick={handleLoginClick}>
          <FaSignInAlt /> Ingresar
        </button>
      )}
    </>
  );

  return (
    <>
      <header className={`navbar-glass ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">

          {/* LOGO */}
          <motion.div
            className="brand-logo"
            onClick={() => navigate("/")}
            whileHover={!isInsidePanel || !isMobile ? { scale: 1.03 } : undefined}
            whileTap={{ scale: 0.97 }}
          >
            {isInsidePanel && isMobile ? (
              <button
                className="sidebar-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new Event("toggleSidebar"));
                }}
                aria-label="Abrir menú"
              >
                <FaBars />
              </button>
            ) : (
              <>
                <motion.span
                  className="brand-mark"
                  whileHover={{ rotate: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  IA
                </motion.span>
                <span className="brand-name">TurnosIA</span>
              </>
            )}
          </motion.div>

          {/* NAV — visible siempre, sin hamburguesa; envuelve en mobile */}
          <div className="nav-right">
            {navLinks}
          </div>
        </div>
      </header>

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

      <RegisterModal
        open={modal === "register"}
        onClose={() => setModal(null)}
        onSuccess={() => setModal("login")}
      />
    </>
  );
}

export default Navbar;
