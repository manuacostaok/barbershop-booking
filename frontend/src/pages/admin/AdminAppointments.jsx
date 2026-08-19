import { useEffect, useState } from "react";
import api from "../../api";
import Calendar from "react-calendar";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTrash,
  FaUndo,
  FaTimes,
  FaCheck,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import BaseModal from "../../components/BaseModal";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

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
      setToast("Turno completado");
      fetchAppointments();
    } catch {
      setToast("Error");
    }
  };

  const reactivateAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/reactivate`);
      setToast("Turno reactivado");
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
        setToast("Turno cancelado");
      }

      if (actionType === "delete") {
        await api.delete(`/appointments/${selectedId}`);
        setToast("Turno eliminado");
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

  const activeFilterCount =
    (filterDate ? 1 : 0) + (filterBarber ? 1 : 0) + (filterStatus ? 1 : 0);

  const clearFilters = () => {
    setFilterDate("");
    setFilterBarber("");
    setFilterStatus("");
  };

  // =========================
  // RESUMEN DE HOY — independiente de los filtros de abajo,
  // siempre muestra el día de hoy para que sea lo primero que
  // se ve al entrar al panel.
  // =========================
  const todayStr = formatDate(new Date());

  const todayAppointments = appointments
    .filter((a) => a.date === todayStr && a.status !== "cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));

  const todayPending = todayAppointments.filter((a) => a.status === "pending").length;
  const todayConfirmed = todayAppointments.filter((a) => a.status === "confirmed").length;
  const todayCompleted = todayAppointments.filter((a) => a.status === "completed").length;

  // =========================
  // UI
  // =========================
  return (
    <div className="page">

      <div className="page-header">
        <h2>Turnos</h2>
        {activeFilterCount > 0 && (
          <button className="button secondary" onClick={clearFilters}>
            Limpiar filtros ({activeFilterCount})
          </button>
        )}
      </div>

      {/* ================= RESUMEN DE HOY ================= */}
      <div className="today-panel">
        <div className="today-panel-header">
          <div>
            <h3>Hoy</h3>
            <span className="today-panel-date">
              {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
          <div className="today-panel-count">
            <span className="today-panel-count-num">{todayAppointments.length}</span>
            <span className="today-panel-count-label">turno{todayAppointments.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {todayAppointments.length > 0 && (
          <div className="today-panel-substats">
            <span><strong>{todayPending}</strong> pendientes</span>
            <span><strong>{todayConfirmed}</strong> confirmados</span>
            <span><strong>{todayCompleted}</strong> completados</span>
          </div>
        )}

        {todayAppointments.length === 0 ? (
          <p className="today-panel-empty">No hay turnos agendados para hoy.</p>
        ) : (
          <div className="today-panel-list">
            {todayAppointments.map((appt) => (
              <div key={appt._id} className="today-appt-row">
                <span className="today-appt-time">{appt.time}</span>
                <div className="today-appt-main">
                  <span className="today-appt-client">{appt.clientName}</span>
                  <span className="today-appt-sub">{appt.service} · {appt.barber?.name || "Sin asignar"}</span>
                </div>
                <span className={`status ${appt.status}`}>{appt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= FILTERS ================= */}
      <div className="page-header" style={{ marginTop: 32 }}>
        <h2>Todos los turnos</h2>
      </div>

      <div className="filter-card">

        <div className="filter-group">
          <span className="filter-label"><FaCalendarAlt /> Fecha</span>
          <div className="filter-date-row">
            <button
              className="button secondary"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              {filterDate ? formatDate(filterDate) : "Cualquier fecha"}
            </button>

            {filterDate && (
              <button className="filter-clear-btn" onClick={() => setFilterDate("")}>
                <FaTimes /> Quitar
              </button>
            )}
          </div>

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
        </div>

        {/* STATUS */}
        <div className="filter-group">
          <span className="filter-label"><FaFilter /> Estado</span>
          <div className="barber-filter-row">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`barber-pill ${filterStatus === opt.value ? "active" : ""}`}
                onClick={() => setFilterStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* BARBERS */}
        {barbers.length > 0 && (
          <div className="filter-group">
            <span className="filter-label">Profesional</span>
            <div className="barber-filter-row">
              <button
                className={`barber-pill ${filterBarber === "" ? "active" : ""}`}
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
        )}
      </div>

      {/* ================= LIST ================= */}
      <div className="section">

        {loading ? (
          <p>Cargando...</p>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <p>No hay turnos con estos filtros</p>
          </div>
        ) : (
          <div className="admin-list">

            {/* HEADER */}
            <div className="row header-row">
              <div>Cliente</div>
              <div>Servicio</div>
              <div>Profesional</div>
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
          <button className="button secondary" onClick={() => setModalOpen(false)}>
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
