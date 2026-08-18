import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

import {
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserShield,
  FaUser,
  FaBars,
  FaTimes,
  FaCalendarCheck,
} from "react-icons/fa";

function Navbar() {
  const [modal, setModal] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // cerrar el menú mobile al cambiar de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const navLinks = (
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
          {isAdmin && !isAdminPanel && (
            <button className={btnClass(false)} onClick={() => navigate("/admin")}>
              <FaUserShield /> Admin
            </button>
          )}

          {isBarber && !isBarberPanel && (
            <button className={btnClass(false)} onClick={() => navigate("/barber")}>
              <FaUserShield /> Panel
            </button>
          )}

          {isClient && !isClientPanel && (
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
          <div className="brand-logo" onClick={() => navigate("/")}>
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
                <span className="brand-mark">IA</span>
                <span className="brand-name">IAturnos</span>
              </>
            )}
          </div>

          {/* DESKTOP NAV */}
          <div className="nav-right desktop-only">
            {navLinks}
          </div>

          {/* MOBILE HAMBURGUER (solo fuera de paneles, ahí ya hay sidebar toggle) */}
          {!isInsidePanel && (
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>

        {/* MOBILE DROPDOWN */}
        {!isInsidePanel && mobileMenuOpen && (
          <div className="mobile-menu">
            {navLinks}
          </div>
        )}
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
