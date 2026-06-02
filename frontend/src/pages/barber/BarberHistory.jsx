import { useOutletContext } from "react-router-dom";

export default function BarberHistory() {
  const { appointments } = useOutletContext();

  const history = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  return (
    <div className="container">
      <div className="card">
        <h2>📜 Historial</h2>

        {history.length === 0 ? (
          <p>No hay historial</p>
        ) : (
          history.map((a) => (
            <div key={a._id} className="card">
              <p>{a.clientName}</p>
              <p>{a.service}</p>
              <p>{a.date}</p>
              <p>{a.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}