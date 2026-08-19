import { useOutletContext } from "react-router-dom";
import { FaHistory } from "react-icons/fa";

export default function ClientHistory() {
  const { appointments } = useOutletContext();

  return (
    <div className="page client-panel">
      <div className="page-header">
        <h1>Historial</h1>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <FaHistory className="empty-icon" />
          <p>Todavía no tenés turnos</p>
        </div>
      ) : (
        <div className="grid">
          {appointments.map((appt) => (
            <div key={appt._id} className="card">
              <h3>{appt.service}</h3>
              <p>{appt.barber?.name || "Sin profesional"}</p>
              <p>{appt.date} · {appt.time}</p>

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
