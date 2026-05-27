import { useEffect, useState } from "react";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import Toast from "../components/Toast";
import BaseModal from "../components/BaseModal";
import { FaClock, FaUser, FaCalendarAlt, FaTimes, FaUndo, FaCheck } from "react-icons/fa";
import { useLocation } from "react-router-dom";

function BarberDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const [toast, setToast] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [actionType, setActionType] = useState(null);

  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const location = useLocation();
  // =========================
  // 🔥 FETCH TURNOS DEL BARBER
  // =========================
  const fetchAppointments = async () => {
    try {
      const res = await api.get(`/appointments/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setAppointments(res.data);
    } catch (err) {
      console.log(err);
      setToast("Error cargando turnos");
    }

    setLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      setCouponCode(code);
      setValidateModal(true);
    }
  }, [location]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // =========================
  // 🔥 FORMAT DATE
  // =========================
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

  // =========================
  // 🔥 FILTRO
  // =========================
  const filteredAppointments = appointments.filter((appt) => {
    return (
      (!filterDate || appt.date === formatDate(filterDate)) &&
      (!filterStatus || appt.status === filterStatus)
    );
  });

  // =========================
  // 🔥 ACTIONS
  // =========================
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

      if (actionType === "reactivate") {
        await api.patch(`/appointments/${selectedId}/reactivate`);
        setToast("Turno reactivado ✅");
      }

      setModalOpen(false);
      fetchAppointments();
    } catch {
      setToast("Error en la acción");
    }
  };
  const completeAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/complete`);
      setToast("Turno completado ✅");
      fetchAppointments();
    } catch {
      setToast("Error completando turno");
    }
  };



  // =========================
  // 🔥 STATS
  // =========================
  const total = appointments.length;
  const today = appointments.filter(
    (a) =>
      a.date === formatDate(new Date()) &&
      a.status !== "cancelled"
  ).length;


  const [validateModal, setValidateModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);

  const validateCoupon = async () => {
    try {
      const res = await api.post("/coupons/validate", {
        code: couponCode,
      });

      setCouponResult(res.data);
    } catch {
      setCouponResult({ valid: false });
    }
  };
  // =========================
  // UI
  // =========================
  return (
    <div className="container">
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* HEADER */}
        <div className="section-title">
          💈 Panel de {user?.name}
        </div>
        <div style={{ marginBottom: 20 }}>
          <button
            className="button primary"
            onClick={() => setValidateModal(true)}
          >
            🎟️ Validar cupón
          </button>
        </div>
        {/* =========================
            🔥 STATS
        ========================= */}
        <div className="grid">
          <div className="card">
            <h3>Total turnos</h3>
            <p>{total}</p>
          </div>

          <div className="card">
            <h3>Hoy</h3>
            <p>{today}</p>
          </div>
        </div>
          <div>
            <br />
          </div>
        {/* =========================
            🔥 FILTRO FECHA
        ========================= */}
        <div className="section">
          <div className="filter-label">📅 Filtrar por fecha</div>
          <br />
          <button
            className="button primary full"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {filterDate ? formatDate(filterDate) : "Seleccionar fecha"}
          </button>
<br />
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                className="calendar-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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
          <div className="filter-block">
            <div className="filter-label">📌 Estado</div>

            <div className="barber-filter-row">
              <button className="barber-pill" onClick={() => setFilterStatus("")}>Todos</button>
              <button className="barber-pill" onClick={() => setFilterStatus("pending")}>Pendiente</button>
              <button className="barber-pill" onClick={() => setFilterStatus("confirmed")}>Confirmado</button>
              <button className="barber-pill" onClick={() => setFilterStatus("completed")}>Completado</button>
              <button className="barber-pill" onClick={() => setFilterStatus("cancelled")}>Cancelado</button>
            </div>
          </div>
        </div>
        <div className="filter-summary">
          {filterDate || filterStatus ? (
            <span>
              Filtros activos:
              {filterDate && ` 📅 ${formatDate(filterDate)}`}
              {filterStatus && ` 📌 ${filterStatus}`}
            </span>
          ) : (
            <span>Mostrando todos los turnos</span>
          )}
        </div>
        {/* =========================
            🔥 LISTA TURNOS
        ========================= */}
        <div className="section">
          <div className="section-title">📅 Tus turnos</div>

          {loading ? (
            <p>Cargando...</p>
          ) : filteredAppointments.length === 0 ? (
            <p>No tenés turnos</p>
          ) : (
            <div className="admin-list">

              {/* HEADER */}
              <div className="row header-row">
                <div>Cliente</div>
                <div>Servicio</div>
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    layout
                    style={{
                      opacity: appt.status === "cancelled" ? 0.5 : 1
                    }}
                  >
                    <div>{appt.clientName}</div>
                    <div>{appt.service}</div>
                    <div>{appt.date}</div>
                    <div>{appt.time}</div>

                    <div className={`status ${appt.status}`}>
                      {appt.status === "pending" && "Pendiente"}
                      {appt.status === "confirmed" && "Confirmado"}
                      {appt.status === "completed" && "Completado"}
                      {appt.status === "cancelled" && "Cancelado"}
                    </div>

                    <div className="actions">

                      {/* ✅ COMPLETAR */}
                      {appt.status !== "completed" && appt.status !== "cancelled" && (
                        <button
                          className="complete-btn"
                          onClick={() => completeAppointment(appt._id)}
                        >
                          <FaCheck  /> Completar
                        </button>
                      )}

                      {/* ❌ CANCELAR */}
                      {appt.status !== "completed" && appt.status !== "cancelled" && (
                        <button
                          className="cancel-btn"
                          onClick={() => openModal(appt._id, "cancel")}
                        >
                          <FaTimes /> Cancelar
                        </button>
                      )}

                      {/* 🔁 REACTIVAR */}
                      {appt.status === "cancelled" && (
                        <button
                          className="reactivate-btn"
                          onClick={() => openModal(appt._id, "reactivate")}
                        >
                          <FaUndo /> Reactivar
                        </button>
                      )}

                      {/* 🔒 COMPLETADO (bloqueado) */}
                      {appt.status === "completed" && (
                        <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                          ✔ Finalizado
                        </span>
                      )}

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* =========================
            🔥 MODAL
        ========================= */}
        <BaseModal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="confirm-modal">
            <h3>
              {actionType === "cancel"
                ? "¿Cancelar turno?"
                : "¿Reactivar turno?"}
            </h3>

            <div className="modal-actions">
              <button onClick={() => setModalOpen(false)}>
                Cancelar
              </button>

              <button className="danger" onClick={handleConfirm}>
                {actionType === "cancel" ? "Cancelar turno" : "Reactivar"}
              </button>
            </div>
          </div>
        </BaseModal>
        <BaseModal open={validateModal} onClose={() => setValidateModal(false)}>
          <div className="confirm-modal">

            <h3>🎟️ Validar cupón</h3>

            <input
              type="text"
              placeholder="Ingresar código"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                marginTop: 10,
                marginBottom: 10,
              }}
            />

            <button className="button primary" onClick={validateCoupon}>
              Validar
            </button>

            {/* RESULTADO */}
            {couponResult && (
              <div style={{ marginTop: 15 }}>
                {couponResult.valid ? (
                  <div style={{ color: "#00ff88" }}>
                    <p>✅ Cupón válido</p>
                    <p><strong>Cliente:</strong> {couponResult.coupon.userId?.name}</p>
                    <p><strong>Servicio:</strong> {couponResult.coupon.service}</p>
                    <p><strong>Fecha:</strong> {new Date(couponResult.coupon.usedAt).toLocaleString()}</p>
                  </div>
                ) : (
                  <p style={{ color: "red" }}>❌ Cupón inválido</p>
                )}
              </div>
            )}

          </div>
        </BaseModal>
        {/* =========================
            🔥 TOAST
        ========================= */}
        <Toast
          message={toast}
          show={!!toast}
          onClose={() => setToast("")}
        />

      </motion.div>
    </div>
  );
}

export default BarberDashboard;