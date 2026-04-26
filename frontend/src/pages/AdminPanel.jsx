import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ConfirmModal from "../components/ConfirmModal";
import Calendar from "react-calendar";

function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [filterDate, setFilterDate] = useState("");
  const [filterBarber, setFilterBarber] = useState("");
  const [barbers, setBarbers] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);

  const openModal = (id) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const confirmCancel = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/appointments/${selectedId}/cancel`
      );

      setModalOpen(false);
      fetchAppointments();
    } catch {
      alert("Error");
    }
  };

  // 🔥 traer turnos
  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/appointments/all"
      );

      setAppointments(res.data);
    } catch (error) {
      console.log("ERROR FETCH:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users/barbers")
      .then((res) => setBarbers(res.data))
      .catch(() => console.log("Error cargando barberos"));
  }, []);


  const formatDate = (date) => {
    if (!date) return "";

    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  const filteredAppointments = appointments.filter((appt) => {
    return (
      (!filterDate || appt.date === formatDate(filterDate)) &&
      (!filterBarber || appt.barber?._id === filterBarber)
    );
  });


  return (
    <div className="container">
      <motion.div
        className="card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="title">Panel Admin</div>

        
        <div className="filters">
          {/* BOTÓN */}
          <button
            className="button"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {filterDate
              ? `Fecha: ${formatDate(filterDate)}`
              : "Elegir fecha"}
          </button>

          {/* SELECT BARBERO */}
          <select
            className="input"
            value={filterBarber}
            onChange={(e) => setFilterBarber(e.target.value)}
          >
            <option value="">Todos los barberos</option>
            {barbers.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        {showCalendar && (
          <div className="calendar-dropdown">
            <Calendar
              onChange={(date) => {
                setFilterDate(date);
                setShowCalendar(false); // 🔥 se cierra solo
              }}
              value={filterDate}
            />
          </div>
        )}

        {loading ? (
          <p>Cargando...</p>
        ) : appointments.length === 0 ? (
          <p>No hay turnos</p>
        ) : (
          <div className="admin-list">
            {filteredAppointments.map((appt) => (
              <div key={appt._id} className="row">
                <div>{appt.clientName}</div>
                <div>{appt.service}</div>
                <div>{appt.barber?.name || "Sin barber"}</div>
                <div>{appt.date}</div>
                <div>{appt.time}</div>

                <button
                  className="cancel-btn"
                  onClick={() => openModal(appt._id)}
                >
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 🔥 MODAL SIEMPRE AFUERA */}
        <ConfirmModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmCancel}
          text="¿Cancelar este turno?"
        />
      </motion.div>
    </div>
  );
}

export default AdminPanel;