import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const btnClass = (active) =>
    `nav-btn ${active ? "active" : ""}`;

  return (
    <>
        <header className={`navbar-glass ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">

          {/* LOGO */}
          <div className="logo" onClick={() => navigate("/")}>
            Logo 
          </div>

          <div className="nav-right">

            {/* HOME */}
            {!isHome && (
              <button
                className={btnClass(false)}
                onClick={() => navigate("/")}
              >
                <FaHome /> Inicio
              </button>
            )}

            {/* USER LOGGED */}
            {user ? (
              <>
                {isAdmin && !isAdminPanel && (
                  <button
                    className={btnClass(false)}
                    onClick={() => navigate("/admin")}
                  >
                    <FaUserShield /> Admin
                  </button>
                )}

                {isBarber && !isBarberPanel && (
                  <button
                    className={btnClass(false)}
                    onClick={() => navigate("/barber")}
                  >
                    <FaUserShield /> Panel
                  </button>
                )}

                {isClient && !isClientPanel && (
                  <button
                    className={btnClass(false)}
                    onClick={() => navigate("/client")}
                  >
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

          </div>
        </div>
      </header>

      {/* MODALS */}
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