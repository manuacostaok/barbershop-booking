import { NavLink, Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";

export default function Sidebar({ items, title, basePath, onClose, open }) {
  return (
    <div className={`sidebar ${open ? "open" : ""}`}>

      <NavLink
        to={basePath}
        end
        onClick={onClose}
        className={({ isActive }) =>
          "logo nav-item" + (isActive ? " active" : "")
        }
      >
        {title}
      </NavLink>

      {items.map((item, i) => (
        <NavLink
          key={i}
          to={item.path}
          onClick={onClose}
          className={({ isActive }) =>
            "nav-item" + (isActive ? " active" : "")
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}

      <Link to="/" onClick={onClose} className="nav-item sidebar-home-link">
        <FaEye />
        <span>Ver mi página</span>
      </Link>
    </div>
  );
}