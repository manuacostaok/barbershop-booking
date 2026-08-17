import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarDay, FaCoffee } from "react-icons/fa";

function BarberToday() {
  const { appointments, loading } = useOutletContext();

  const todayDate = new Date().toISOString().split("T")[0];

  const todayAppointments = appointments
    .filter((a) => a.date === todayDate && a.status !== "cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="container">
      <div className="page-header">
        <h2>Turnos de hoy</h2>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : todayAppointments.length === 0 ? (
        <div className="empty-state">
          <FaCoffee className="empty-icon" />
          <p>No tenés turnos para hoy. Aprovechá para tomar un café ☕</p>
        </div>
      ) : (
        <div>
          {todayAppointments.map((appt) => (
            <motion.div
              key={appt._id}
              className="list-row"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="list-row-main">
                <span className="list-row-title">{appt.clientName}</span>
                <span className="list-row-sub">
                  {appt.service} · <FaCalendarDay style={{ verticalAlign: -1 }} /> {appt.time}
                </span>
              </div>

              <div className={`status ${appt.status}`}>{appt.status}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BarberToday;
