import { FaUser } from "react-icons/fa";

export default function BarberProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const initial = user?.name?.charAt(0)?.toUpperCase() || "B";

  return (
    <div className="container">
      <div className="page-header">
        <h2>Mi perfil</h2>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">{initial}</div>
        <div className="profile-info">
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          {user?.phone && <p>{user.phone}</p>}
        </div>
      </div>
    </div>
  );
}
