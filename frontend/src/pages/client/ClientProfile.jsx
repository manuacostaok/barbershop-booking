import { useOutletContext } from "react-router-dom";

export default function ClientProfile() {
  const { user } = useOutletContext();

  return (
    <div className="page client-panel">
      <h1>👤 Mi perfil</h1>

      <div className="card">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <p>📞 {user.phone}</p>
      </div>
    </div>
  );
}