import { useOutletContext } from "react-router-dom";

export default function ClientHistory() {
  const { appointments } = useOutletContext();

  return (
    <div className="page client-panel">
      <h1>📜 Historial</h1>

      {appointments.length === 0 ? (
        <p>No tenés turnos</p>
      ) : (
        <div className="grid">
          {appointments.map((appt) => (
            <div key={appt._id} className="card">
              <h3>✂️ {appt.service}</h3>
              <p>🧔 {appt.barber?.name || "Sin barbero"}</p>
              <p>📅 {appt.date}</p>
              <p>⏱️ {appt.time}</p>

              <span className={`status ${appt.status}`}>
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}