import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { FaCalendar, FaUsers, FaChartBar, FaCog, FaEye, FaCommentDots, FaBars, FaSignOutAlt, FaHome } from "react-icons/fa";
import { useState } from "react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="admin-layout">

      <button
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <FaBars />
      </button>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        <NavLink
          to="/admin"
          end
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            "logo nav-item" + (isActive ? " active" : "")
          }
        >
          Admin
        </NavLink>

        <NavLink
          to="/admin"
          end
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          <FaHome />
          <span>Inicio</span>
        </NavLink>

        <NavLink
          to="/admin/appointments"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          <FaCalendar />
          <span>Turnos</span>
        </NavLink>

        <NavLink
          to="/admin/management"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          <FaUsers />
          <span>Gestión</span>
        </NavLink>

        <NavLink
          to="/admin/stats"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          <FaChartBar />
          <span>Estadísticas</span>
        </NavLink>

        <NavLink
          to="/admin/config"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          <FaCog />
          <span>Configuración</span>
        </NavLink>

        <NavLink
          to="/admin/feedback"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          <FaCommentDots />
          <span>Feedback</span>
        </NavLink>

        <Link to="/" onClick={() => setSidebarOpen(false)} className="nav-item sidebar-home-link">
          <FaEye />
          <span>Ver mi página</span>
        </Link>

        <button onClick={handleLogout} className="nav-item sidebar-logout-btn">
          <FaSignOutAlt />
          <span>Salir</span>
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="admin-content">
        <Outlet />
      </div>

      {/* 🔥 OVERLAY */}
      <div
        className={`overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

    </div>
  );
}