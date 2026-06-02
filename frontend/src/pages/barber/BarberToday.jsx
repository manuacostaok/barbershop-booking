import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

function BarberToday() {
  const { appointments, loading } = useOutletContext();

  const todayDate = new Date().toISOString().split("T")[0];

  const todayAppointments = appointments.filter(
    (a) => a.date === todayDate && a.status !== "cancelled"
  );

  return (
    <div className="container">
      <div className="card">

        <h2>📅 Turnos de hoy</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : todayAppointments.length === 0 ? (
          <p>No hay turnos hoy</p>
        ) : (
          <div className="admin-list">

            {todayAppointments.map((appt) => (
              <motion.div key={appt._id} className="row">

                <div>{appt.clientName}</div>
                <div>{appt.service}</div>
                <div>{appt.time}</div>

                <div className={`status ${appt.status}`}>
                  {appt.status}
                </div>

              </motion.div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default BarberToday;