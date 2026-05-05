import { FaEdit } from "react-icons/fa";

function AppBrand({ user, onEditAvatar }) {
  return (
    <div className="app-brand">
      <div className="brand-avatar-wrapper">

        <img
          src={user?.avatar || "/"}
          className="brand-avatar"
          alt="avatar"
        />

        {/* SOLO ADMIN */}
        {onEditAvatar && (
          <button
            className="avatar-edit-btn"
            onClick={onEditAvatar}
            type="button"
          >
            <FaEdit />
          </button>
        )}

      </div>
    </div>
  );
}

export default AppBrand;