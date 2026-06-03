import { useEffect, useState, useMemo } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import Toast from "../../components/Toast";
import BaseModal from "../../components/BaseModal";
import { FaTimes, FaUndo, FaCheck } from "react-icons/fa";

function BarberAppointments() {
  const user = JSON.parse(localStorage.getItem("user"));

  const { appointments, loading, fetchAppointments } = useOutletContext();

  const [filterDate, setFilterDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const [toast, setToast] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [actionType, setActionType] = useState(null);

  const [filterStatus, setFilterStatus] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 CUPÓN
  const [validateModal, setValidateModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      setCouponCode(code);
      setValidateModal(true);

      setTimeout(() => {
        validateCoupon(code);
      }, 300);

      navigate("/barber", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (filterDate) setShowCalendar(false);
  }, [filterDate]);

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

  const confirmAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/confirm`);
      setToast("Turno confirmado ✅");
      fetchAppointments();
    } catch {
      setToast("Error confirmando turno");
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      return (
        (!filterDate || appt.date === formatDate(filterDate)) &&
        (!filterStatus || appt.status === filterStatus)
      );
    });
  }, [appointments, filterDate, filterStatus]);

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

  const total = appointments.length;

  const today = appointments.filter(
    (a) =>
      a.date === formatDate(new Date()) &&
      a.status !== "cancelled"
  ).length;

  const validateCoupon = async (codeParam) => {
    try {
      const res = await api.post("/coupons/validate", {
        code: codeParam || couponCode,
      });

      setCouponResult(res.data);

      if (res.data.valid) {
        setToast("Cupón validado correctamente 🎉");
      } else {
        setToast(res.data.message || "Cupón inválido");
      }
    } catch {
      setCouponResult({ valid: false });
      setToast("Error validando cupón");
    }
  };

  return (
    <div className="page">

      <div className="section-title">
        💈 Panel de {user?.name}
      </div>

      {/* BOTÓN CUPÓN */}
      <div style={{ marginBottom: 20 }}>
        <button
          className="button primary"
          onClick={() => {
            setCouponCode("");
            setCouponResult(null);
            setValidateModal(true);
          }}
        >
          🎟️ Validar cupón
        </button>
      </div>

      {/* STATS */}
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

      <br />

      {/* FILTROS */}
      <div className="section">

        <button
          className="button secondary"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          📅 {filterDate ? formatDate(filterDate) : "Seleccionar fecha"}
        </button>

        <AnimatePresence>
          {showCalendar && (
            <motion.div
              className="calendar-wrapper"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Calendar
                onChange={(date) => setFilterDate(date)}
                value={filterDate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="barber-filter-row">
          {["", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              className={`barber-pill ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s || "Todos"}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA */}
      <div className="section">

        {loading ? (
          <p>Cargando...</p>
        ) : filteredAppointments.length === 0 ? (
          <p>No tenés turnos</p>
        ) : (
          <div className="admin-list">

            {/* HEADER IGUAL ADMIN */}
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
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  <div>{appt.clientName}</div>
                  <div>{appt.service}</div>
                  <div>{appt.date}</div>
                  <div>{appt.time}</div>

                  <div className={`status ${appt.status}`}>
                    {appt.status}
                  </div>

                  <div className="actions">

                    {appt.status === "pending" && (
                      <button
                        className="reactivate-btn"
                        onClick={() => confirmAppointment(appt._id)}
                      >
                        <FaCheck /> Confirmar
                      </button>
                    )}

                    {appt.status === "confirmed" && (
                      <button
                        className="complete-btn"
                        onClick={() => completeAppointment(appt._id)}
                      >
                        <FaCheck /> Completar
                      </button>
                    )}

                    {appt.status !== "completed" && appt.status !== "cancelled" && (
                      <button
                        className="cancel-btn"
                        onClick={() => openModal(appt._id, "cancel")}
                      >
                        <FaTimes /> Cancelar
                      </button>
                    )}

                    {appt.status === "cancelled" && (
                      <button
                        className="reactivate-btn"
                        onClick={() => openModal(appt._id, "reactivate")}
                      >
                        <FaUndo /> Reactivar
                      </button>
                    )}

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

      {/* MODAL */}
      <BaseModal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="modal-content">
          <p>
            {actionType === "cancel"
              ? "¿Seguro que querés cancelar el turno?"
              : "¿Seguro que querés reactivar el turno?"}
          </p>
        </div>

        <div className="modal-actions">
          <button onClick={() => setModalOpen(false)}>
            Volver
          </button>

          <button className="cancel-btn" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </BaseModal>

      <Toast message={toast} show={!!toast} onClose={() => setToast("")} />

    </div>
  );
}

export default BarberAppointments;