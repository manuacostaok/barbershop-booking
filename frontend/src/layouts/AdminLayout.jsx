import { NavLink, Outlet, Link } from "react-router-dom";
import { FaCalendar, FaUsers, FaChartBar, FaCog, FaEye, FaCommentDots } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop

  useEffect(() => {
    const handleToggle = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(prev => !prev); // mobile overlay
      } else {
        setCollapsed(prev => !prev); // desktop collapse
      }
    };

    window.addEventListener("toggleSidebar", handleToggle);

    return () => {
      window.removeEventListener("toggleSidebar", handleToggle);
    };
  }, []);

  
  return (
    <div className="admin-layout">

      

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