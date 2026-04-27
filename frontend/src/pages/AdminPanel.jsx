import { useEffect, useState } from "react";
import api from "../api"; // 🔥 CAMBIO ACÁ
import ConfirmModal from "../components/ConfirmModal";
import Calendar from "react-calendar";
import { AnimatePresence, motion } from "framer-motion";
import Toast from "../components/Toast";
import { FaTrash, FaUndo, FaTimes } from "react-icons/fa";

function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [filterDate, setFilterDate] = useState("");
  const [filterBarber, setFilterBarber] = useState("");
  const [barbers, setBarbers] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);

  const [toast, setToast] = useState("");
  const [actionType, setActionType] = useState(null);

  const openModal = (id, type) => {
    setSelectedId(id);
    setActionType(type);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (actionType === "cancel") {
        await api.patch(`/appointments/${selectedId}/cancel`);
        setToast("Turno cancelado ❌");
      }

      if (actionType === "delete") {
        await api.delete(`/appointments/${selectedId}`);
        setToast("Turno eliminado 🗑️");
      }

      setModalOpen(false);
      fetchAppointments();
    } catch {
      setToast("Error en la acción");
    }
  };

  const reactivateAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/reactivate`);

      setToast("Turno reactivado ✅");
      fetchAppointments();
    } catch {
      setToast("Error reactivando turno");
    }
  };

  const logout = () => {
    setToast("Cerrando sesión...");

    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }, 600);
  };
  // 🔥 traer turnos
  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/all");
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
    api
      .get("/users/barbers")
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
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        <div className="header">
          <div className="title">Adminstrador</div>

          <button className="logout-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div>

        {/* FILTROS */}
        <div className="filters">
          <button className="button" onClick={() => setShowCalendar(!showCalendar)}>
            {filterDate ? `Fecha: ${formatDate(filterDate)}` : "Elegir fecha"}
          </button>

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

        <AnimatePresence>
          {showCalendar && (
            <motion.div
              className="calendar-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Calendar
                onChange={(date) => {
                  setFilterDate(date);
                  setShowCalendar(false);
                }}
                value={filterDate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p>Cargando...</p>
        ) : appointments.length === 0 ? (
          <p>No hay turnos</p>
        ) : (
          <div className="admin-list">
            <AnimatePresence>
              {filteredAppointments.map((appt) => (
                <motion.div
                  key={appt._id}
                  className="row"
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    opacity: appt.status === "cancelled" ? 0.5 : 1,
                  }}
                >
                  <div>{appt.clientName}</div>
                  <div>{appt.service}</div>
                  <div>{appt.barber?.name || "Sin barber"}</div>
                  <div>{appt.date}</div>
                  <div>{appt.time}</div>

                  <div className={`status ${appt.status}`}>
                    {appt.status === "pending" && "Pendiente"}
                    {appt.status === "confirmed" && "Confirmado"}
                    {appt.status === "cancelled" && "Cancelado"}
                  </div>

                  {appt.status !== "cancelled" && (
                    <button
                      className="cancel-btn"
                      onClick={() => openModal(appt._id, "cancel")}
                    >
                      <FaTimes /> Cancelar
                    </button>
                  )}

                  {appt.status === "cancelled" && (
                    <>
                      <button
                        className="reactivate-btn"
                        onClick={() => reactivateAppointment(appt._id)}
                      >
                        <FaUndo /> Reactivar
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => openModal(appt._id, "delete")}
                      >
                        <FaTrash /> Borrar
                      </button>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <ConfirmModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
          text={
            actionType === "delete"
              ? "¿Eliminar este turno definitivamente?"
              : "¿Cancelar este turno?"
          }
        />

        <Toast message={toast} show={!!toast} onClose={() => setToast("")} />
      </motion.div>
    </div>
  );
}

export default AdminPanel;