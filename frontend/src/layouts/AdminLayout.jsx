import { NavLink, Outlet } from "react-router-dom";
import { FaCalendar, FaUsers, FaChartBar, FaCog } from "react-icons/fa";
import { useState } from "react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          💈 Admin
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
      </div>

      {/* CONTENIDO */}
      <div className="admin-content">
        <Outlet />
      </div>

      {/* 🔥 OVERLAY */}
      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    </div>
  );
}