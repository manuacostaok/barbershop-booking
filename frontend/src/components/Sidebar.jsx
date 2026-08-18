import { NavLink } from "react-router-dom";

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
    </div>
  );
}