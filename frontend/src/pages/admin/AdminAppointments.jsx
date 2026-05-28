import { useEffect, useState } from "react";
import api from "../../api";
import Calendar from "react-calendar";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTrash,
  FaUndo,
  FaTimes,
  FaCheck
} from "react-icons/fa";
import BaseModal from "../../components/BaseModal";

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [actionType, setActionType] = useState(null);

  const [filterDate, setFilterDate] = useState("");
  const [filterBarber, setFilterBarber] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [barbers, setBarbers] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [toast, setToast] = useState("");

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return d.toISOString().split("T")[0];
  };

  // =========================
  // FETCH
  // =========================
  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/all");
      setAppointments(res.data);
    } catch {
      setToast("Error cargando turnos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    api.get("/users/barbers")
      .then((res) => setBarbers(res.data))
      .catch(() => {});
  }, []);

  // =========================
  // ACTIONS
  // =========================
  const completeAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/complete`);
      setToast("Turno completado ✅");
      fetchAppointments();
    } catch {
      setToast("Error");
    }
  };

  const reactivateAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/reactivate`);
      setToast("Turno reactivado 🔄");
      fetchAppointments();
    } catch {
      setToast("Error");
    }
  };

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
      setToast("Error en acción");
    }
  };

  // =========================
  // FILTERS
  // =========================
  const filteredAppointments = appointments.filter((appt) => {
    return (
      (!filterDate || appt.date === formatDate(filterDate)) &&
      (!filterBarber || appt.barber?._id === filterBarber) &&
      (!filterStatus || appt.status === filterStatus)
    );
  });

  // =========================
  // UI
  // =========================
  return (
    <div className="page">

      <div className="section-title">📅 Turnos</div>

      {/* ================= FILTERS ================= */}
      <div className="filter-section">

        {/* DATE */}
        <button
          className="button secondary"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          📅 {filterDate ? formatDate(filterDate) : "Seleccionar fecha"}
        </button>

        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="calendar-wrapper"
            >
              <Calendar
                value={filterDate}
                onChange={(date) => {
                  setFilterDate(date);
                  setShowCalendar(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATUS */}
        <div className="barber-filter-row">
          <button className="barber-pill" onClick={() => setFilterStatus("")}>Todos</button>
          <button className="barber-pill" onClick={() => setFilterStatus("pending")}>Pendiente</button>
          <button className="barber-pill" onClick={() => setFilterStatus("confirmed")}>Confirmado</button>
          <button className="barber-pill" onClick={() => setFilterStatus("completed")}>Completado</button>
          <button className="barber-pill" onClick={() => setFilterStatus("cancelled")}>Cancelado</button>
        </div>

        {/* BARBERS */}
        <div className="barber-filter-row">
          <button
            className={`barber-pill ${filterBarber === "" ? "active-all" : ""}`}
            onClick={() => setFilterBarber("")}
          >
            Todos
          </button>

          {barbers.map((b) => (
            <button
              key={b._id}
              className={`barber-pill ${filterBarber === b._id ? "active" : ""}`}
              onClick={() => setFilterBarber(b._id)}
            >
              <img src={b.avatar || "https://i.pravatar.cc/100"} />
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div className="section">

        {loading ? (
          <p>Cargando...</p>
        ) : filteredAppointments.length === 0 ? (
          <p>No hay turnos</p>
        ) : (
          <div className="admin-list">

            {/* HEADER */}
            <div className="row header-row">
              <div>Cliente</div>
              <div>Servicio</div>
              <div>Barbero</div>
              <div>Fecha</div>
              <div>Hora</div>
              <div>Estado</div>
              <div>Acciones</div>
            </div>

            <AnimatePresence>
              {filteredAppointments.map((appt) => (
                <motion.div
                  key={appt._id}
                  className="row"
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >

                  <div>{appt.clientName}</div>
                  <div>{appt.service}</div>
                  <div>{appt.barber?.name}</div>
                  <div>{appt.date}</div>
                  <div>{appt.time}</div>

                  <div className={`status ${appt.status}`}>
                    {appt.status}
                  </div>

                  <div className="actions">

                    {appt.status !== "completed" && appt.status !== "cancelled" && (
                      <>
                        <button
                          className="complete-btn"
                          onClick={() => completeAppointment(appt._id)}
                        >
                          <FaCheck /> Completar
                        </button>

                        <button
                          className="cancel-btn"
                          onClick={() => openModal(appt._id, "cancel")}
                        >
                          <FaTimes /> Cancelar
                        </button>
                      </>
                    )}

                    {appt.status === "completed" && (
                      <button
                        className="delete-btn"
                        onClick={() => openModal(appt._id, "delete")}
                      >
                        <FaTrash /> Borrar
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

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      <BaseModal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="modal-content">
          <p>
            {actionType === "cancel"
              ? "¿Seguro que querés cancelar el turno?"
              : "¿Seguro que querés eliminar el turno?"}
          </p>
        </div>

        <div className="modal-actions">
          <button className="button" onClick={() => setModalOpen(false)}>
            Volver
          </button>

          <button className="cancel-btn" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </BaseModal>

      {/* ================= TOAST ================= */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

    </div>
  );
}

export default AdminAppointments;