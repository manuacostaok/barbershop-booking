import { useEffect, useState } from "react";
import api from "../api";
import ConfirmModal from "../components/ConfirmModal";
import Calendar from "react-calendar";
import { AnimatePresence, motion } from "framer-motion";
import Toast from "../components/Toast";
import { FaTrash, FaUndo, FaTimes } from "react-icons/fa";
import CreateBarberModal from "../components/CreateBarberModal";
import StatsCharts from "../components/StatsCharts";
import Navbar from "../components/Navbar";

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

  const [stats, setStats] = useState(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const createBarber = async () => {
    if (!newName || !newEmail || !newPassword) {
      setToast("Completá todos los campos");
      return;
    }

    try {
      await api.post("/users/barbers", {
        name: newName,
        email: newEmail,
        password: newPassword,
      });

      setToast("Barbero creado ✂️");

      setNewName("");
      setNewEmail("");
      setNewPassword("");

      const res = await api.get("/users/barbers");
      setBarbers(res.data);

    } catch (err) {
      setToast(err.response?.data?.message || "Error creando barbero");
    }
    setShowCreateModal(false);
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
      localStorage.clear();
      window.location.href = "/login";
    }, 600);
  };

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
    api.get("/users/barbers")
      .then((res) => setBarbers(res.data))
      .catch(() => console.log("Error cargando barberos"));
  }, []);

  useEffect(() => {
    api.get("/appointments/stats").then(res => setStats(res.data));
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
         <>
        <Navbar />
        {/* HEADER */}
        <div className="header-pro">
          <div className="title">Administrador</div>
          <button className="logout-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div></>

        <div className="barbers-row">
          {barbers.map((b) => (
            <div key={b._id} className="barber-card">
              <img
                src={b.avatar || "https://i.pravatar.cc/100"}
                alt={b.name}
              />
              <span>{b.name}</span>
            </div>
          ))}
        </div>

        {stats && <StatsCharts stats={stats} />}

        {/* CREAR BARBERO */}
        <div className="section">
          <div className="section-title">✂️ Crear barbero</div>

          <div className="filters">
            <input className="input" placeholder="Nombre" onChange={e => setNewName(e.target.value)} />
            <input className="input" placeholder="Email" onChange={e => setNewEmail(e.target.value)} />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="button create-btn" onClick={() => setShowCreateModal(true)}>
              + Crear barbero
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className="section">
          <div className="section-title">🔎 Filtros</div>

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
        </div>

        {/* TURNOS */}
        <div className="section">
          <div className="section-title">📅 Ver turnos</div>

          {loading ? (
            <p>Cargando...</p>
          ) : filteredAppointments.length === 0 ? (
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
                    style={{ opacity: appt.status === "cancelled" ? 0.5 : 1 }}
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
        </div>

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
        <CreateBarberModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={createBarber}
          name={newName}
          setName={setNewName}
          email={newEmail}
          setEmail={setNewEmail}
          password={newPassword}
          setPassword={setNewPassword}
        />
      </motion.div>
    </div>
    
  );
}

export default AdminPanel;