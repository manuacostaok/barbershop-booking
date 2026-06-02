import { useOutletContext } from "react-router-dom";

export default function ClientNext() {
  const { nextAppointment } = useOutletContext();

  return (
    <div className="page client-panel">
      <h1>📅 Próximo turno</h1>

      {nextAppointment ? (
        <div className="card highlight">
          <p>✂️ {nextAppointment.service}</p>
          <p>🧔 {nextAppointment.barber?.name}</p>
          <p>📅 {nextAppointment.date}</p>
          <p>⏱️ {nextAppointment.time}</p>
          <span className={`status ${nextAppointment.status}`}>
            {nextAppointment.status}
          </span>
        </div>
      ) : (
        <p>No tenés turnos</p>
      )}
    </div>
  );
}