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

      navigate("/barber", { replace: true }); // 🔥 FIX
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
    <div className="container">
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        <div className="section-title">
          💈 Panel de {user?.name}
        </div>

        <div style={{ marginBottom: 20 }}>
          <button className="button primary" onClick={() => {
            setCouponCode("");
            setCouponResult(null);
            setValidateModal(true);
          }}>
            🎟️ Validar cupón
          </button>
        </div>

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

        <div><br /></div>

        <div className="section">
          <div className="filter-label">📅 Filtrar por fecha</div>
          <br />

          <button className="button primary full" onClick={() => setShowCalendar(!showCalendar)}>
            {filterDate ? formatDate(filterDate) : "Seleccionar fecha"}
          </button>

          <AnimatePresence>
            {showCalendar && (
              <motion.div className="calendar-dropdown">
                <Calendar
                  onChange={(date) => setFilterDate(date)}
                  value={filterDate}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="filter-block">
            <div className="filter-label">📌 Estado</div>

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
        </div>

        <div className="section">
          {loading ? (
            <p>Cargando...</p>
          ) : filteredAppointments.length === 0 ? (
            <p>No tenés turnos</p>
          ) : (
            <div className="admin-list">
              <AnimatePresence>
                {filteredAppointments.map((appt) => (
                  <motion.div key={appt._id} className="row">

                    <div>{appt.clientName}</div>
                    <div>{appt.service}</div>
                    <div>{appt.date}</div>
                    <div>{appt.time}</div>

                    <div className={`status ${appt.status}`}>
                      {appt.status}
                    </div>

                    <div className="actions">

                      {appt.status !== "completed" && appt.status !== "cancelled" && (
                        <button className="complete-btn" onClick={() => completeAppointment(appt._id)}>
                          <FaCheck /> Completar
                        </button>
                      )}

                      {appt.status !== "completed" && appt.status !== "cancelled" && (
                        <button className="cancel-btn" onClick={() => openModal(appt._id, "cancel")}>
                          <FaTimes /> Cancelar
                        </button>
                      )}

                      {appt.status === "cancelled" && (
                        <button className="reactivate-btn" onClick={() => openModal(appt._id, "reactivate")}>
                          <FaUndo /> Reactivar
                        </button>
                      )}

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <Toast message={toast} show={!!toast} onClose={() => setToast("")} />

      </motion.div>
    </div>
  );
}

export default BarberAppointments;