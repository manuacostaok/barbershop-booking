import { NavLink, Outlet } from "react-router-dom";
import { FaCalendar, FaUsers, FaChartBar, FaCog } from "react-icons/fa";

export default function AdminLayout() {
  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">💈 Admin</h2>

        <NavLink
          to="/admin/appointments"
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          <FaCalendar />
          <span>Turnos</span>
        </NavLink>

        <NavLink
          to="/admin/management"
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          <FaUsers />
          <span>Gestión</span>
        </NavLink>

        <NavLink
          to="/admin/stats"
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          <FaChartBar />
          <span>Estadísticas</span>
        </NavLink>

        <NavLink
          to="/admin/config"
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

    </div>
  );
}