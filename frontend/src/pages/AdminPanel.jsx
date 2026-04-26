import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ConfirmModal from "../components/ConfirmModal";

function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

  return (
    <div className="container">
      <motion.div
        className="card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="title">Panel Admin</div>

        {loading ? (
          <p>Cargando...</p>
        ) : appointments.length === 0 ? (
          <p>No hay turnos</p>
        ) : (
          <div className="admin-list">
            {appointments.map((appt) => (
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