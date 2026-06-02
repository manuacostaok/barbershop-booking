export default function BarberProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container">
      <div className="card">
        <h2>👤 Perfil</h2>

        <p><strong>Nombre:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>
    </div>
  );
}