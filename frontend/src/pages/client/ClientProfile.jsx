import { useOutletContext } from "react-router-dom";

export default function ClientProfile() {
  const { user } = useOutletContext();
  const initial = user?.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="page client-panel">
      <div className="page-header">
        <h1>Mi perfil</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">{initial}</div>
        <div className="profile-info">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <p>{user.phone}</p>
        </div>
      </div>
    </div>
  );
}
