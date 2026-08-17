import { useOutletContext } from "react-router-dom";
import { FaHistory } from "react-icons/fa";

export default function BarberHistory() {
  const { appointments } = useOutletContext();

  const history = appointments
    .filter((a) => a.status === "completed" || a.status === "cancelled")
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="container">
      <div className="page-header">
        <h2>Historial</h2>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <FaHistory className="empty-icon" />
          <p>Todavía no hay turnos en tu historial</p>
        </div>
      ) : (
        <div>
          {history.map((a) => (
            <div key={a._id} className="list-row">
              <div className="list-row-main">
                <span className="list-row-title">{a.clientName}</span>
                <span className="list-row-sub">
                  {a.service} · {a.date}
                </span>
              </div>
              <div className={`status ${a.status}`}>{a.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
