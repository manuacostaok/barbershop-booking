import { useOutletContext } from "react-router-dom";
import { FaCut, FaUserTie, FaCalendarAlt, FaClock, FaCalendarTimes } from "react-icons/fa";

export default function ClientNext() {
  const { nextAppointment } = useOutletContext();

  return (
    <div className="page client-panel">
      <div className="page-header">
        <h1>Próximo turno</h1>
      </div>

      {nextAppointment ? (
        <div className="card highlight next-appointment-card">
          <div className={`status ${nextAppointment.status}`} style={{ marginBottom: 14 }}>
            {nextAppointment.status}
          </div>
          <p><FaCut /> {nextAppointment.service}</p>
          <p><FaUserTie /> {nextAppointment.barber?.name}</p>
          <p><FaCalendarAlt /> {nextAppointment.date}</p>
          <p><FaClock /> {nextAppointment.time}</p>
        </div>
      ) : (
        <div className="empty-state">
          <FaCalendarTimes className="empty-icon" />
          <p>No tenés turnos reservados todavía</p>
        </div>
      )}
    </div>
  );
}
