import { Link } from "react-router-dom";
import { FaBars, FaCalendarCheck } from "react-icons/fa";

// Barra superior de los paneles (admin/barbero/cliente) en mobile.
// Siempre visible: el botón de la izquierda abre el sidebar, el
// ícono de la derecha lleva a la página pública de inicio.
export default function MobileTopbar({ onMenuClick }) {
  return (
    <div className="mobile-topbar">
      <button
        className="mobile-sidebar-toggle"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <FaBars />
      </button>

      <Link to="/" className="mobile-topbar-home" aria-label="Ir al inicio">
        <FaCalendarCheck />
      </Link>
    </div>
  );
}
