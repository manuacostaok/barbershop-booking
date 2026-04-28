import { useEffect, useState } from "react";
import api from "../api";
import ConfirmModal from "../components/ConfirmModal";
import Calendar from "react-calendar";
import { AnimatePresence, motion } from "framer-motion";
import Toast from "../components/Toast";
import { FaTrash, FaEdit, FaSignOutAlt, FaUndo, FaTimes } from "react-icons/fa";
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

  const [createType, setCreateType] = useState(null); // "barber" | "service"
  const [newPrice, setNewPrice] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [services, setServices] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const [editBarber, setEditBarber] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [confirmDeleteBarber, setConfirmDeleteBarber] = useState(false);

  const openEditBarber = (barber) => {
    setEditBarber(barber);
    setEditName(barber.name);
    setEditEmail(barber.email || "");
  };

  const updateBarber = async () => {
    try {
      await api.put(`/users/${editBarber._id}`, {
        name: editName,
        email: editEmail,
      });

      setToast("Barbero actualizado ✂️");

      setEditBarber(null);

      const res = await api.get("/users/barbers");
      setBarbers(res.data);

    } catch {
      setToast("Error actualizando");
    }
  };

  const deleteBarber = async () => {
    try {
      await api.delete(`/users/${editBarber._id}`);

      setToast("Barbero eliminado 🗑️");

      setEditBarber(null);
      setConfirmDeleteBarber(false);

      const res = await api.get("/users/barbers");
      setBarbers(res.data);

    } catch {
      setToast("Error eliminando");
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

  useEffect(() => {
    api.get("/services")
      .then(res => setServices(res.data))
      .catch(() => setToast("Error cargando cortes"));
  }, []);

  const deleteService = async (id) => {
    try {
      await api.delete(`/services/${id}`);

      setToast("Corte eliminado 🗑️");

      // refrescar lista
      const res = await api.get("/services");
      setServices(res.data);

    } catch (err) {
      setToast("Error eliminando corte");
    }
  };

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


  const handleCreate = async () => {
    try {
      if (createType === "barber") {
        if (!newName || !newEmail || !newPassword) {
          return setToast("Completá todos los campos");
        }

        await api.post("/users/barbers", {
          name: newName,
          email: newEmail,
          password: newPassword,
        });

        setToast("Barbero creado ✂️");
      }

      if (createType === "service") {
        if (!newName || !newPrice) {
          return setToast("Completá nombre y precio");
        }

        await api.post("/services", {
          name: newName,
          price: newPrice,
        });

        setToast("Corte creado 💈");
      }

      setShowCreateModal(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewPrice("");

    } catch (err) {
      setToast(err.response?.data?.message || "Error creando");
    }
  };


  return (
    
    <div className="container">
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* HEADER */}
        <div className="header-pro">
          <div className="title">Administrador</div>

          <div className="header-right">
            {user && (
              <div className="user-box" onClick={logout}>
                <span className="admin-name">{user.name}</span>
                <FaSignOutAlt className="logout-icon" />
              </div>
            )}
          </div>
        </div>

        {/* ============================= */}
        {/* 🔥 CREAR BARBERO / CORTE */}
        {/* ============================= */}

        <div className="section">
          <div className="section-title">⚙️ Gestión</div>

          <div className="filters">
            {/* CREAR BARBERO */}
            <button
              className="button create-btn"
              onClick={() => {
                setCreateType("barber");
                setShowCreateModal(true);
              }}
            >
              + Crear barbero
            </button>

            {/* CREAR CORTE */}
            <button
              className="button create-btn"
              onClick={() => {
                setCreateType("service");
                setShowCreateModal(true);
              }}
            >
              + Crear corte
            </button>
          </div>
        </div>


        {/* ============================= */}
        {/* 🔥 MODAL REUTILIZADO */}
        {/* ============================= */}

        <CreateBarberModal
          key={createType} // 🔥 ESTO SOLUCIONA TODO

          open={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setCreateType(null); // 🔥 limpia estado
          }}
          onCreate={handleCreate}

          type={createType} // 🔥 clave

          name={newName}
          setName={setNewName}
          email={newEmail}
          setEmail={setNewEmail}
          password={newPassword}
          setPassword={setNewPassword}

          price={newPrice}
          setPrice={setNewPrice}
        />

        

        <div className="section">

        <div className="section-title">🧔 Barberos</div>

        <div className="barbers-row">
          {barbers.map((b) => (
            <div key={b._id} className="barber-card">
               <div className="barber-edit" onClick={() => openEditBarber(b)}>
                <FaEdit />
              </div>
              <img
                src={b.avatar || "https://i.pravatar.cc/100"}
                alt={b.name}
              />
              <span>{b.name}</span>
            </div>
          ))}
        </div>
        </div>

        <div className="section">

        <div className="section">
          <div className="section-title">💈 Cortes</div>

          <div className="barbers-row">
            {services.map((s) => (
              <div key={s._id} className="barber-card service-card">

                <div className="service-info">
                  <span className="service-name">{s.name}</span>
                  <span className="service-price">${s.price}</span>
                </div>

                <button
                  className="delete-service-btn"
                  onClick={() => deleteService(s._id)}
                >
                  <FaTrash />
                </button>

              </div>
            ))}
          </div>
        </div>


        <div className="section-title">📊 Estadísticas</div>

        {stats && <StatsCharts stats={stats} />}

        </div>

        

        {/* FILTROS */}
        <div className="section">
          <div className="section-title">🔎 Filtrar turnos </div>

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
          open={!!editBarber}
          onClose={() => setEditBarber(null)}
          hideButtons={true}
        >
          <div className="edit-modal">
            <h3>Editar barbero ✂️</h3>

            {/* AVATAR (placeholder por ahora) */}
            <div className="avatar-preview">
              <img
                src={editBarber?.avatar || "https://i.pravatar.cc/100"}
                alt="avatar"
              />
              <span className="avatar-text">Avatar próximamente</span>
            </div>

            <input
              className="input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nombre"
            />

            <input
              className="input"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
            />

            <div className="modal-actions">
              <button className="button" onClick={updateBarber}>
                Confirmar
              </button>

              <button
                className="delete-btn"
                onClick={() => setConfirmDeleteBarber(true)}
              >
                Borrar
              </button>
            </div>
          </div>
        </ConfirmModal>
        <ConfirmModal
          open={confirmDeleteBarber}
          onClose={() => setConfirmDeleteBarber(false)}
          onConfirm={deleteBarber}
          text="¿Seguro que querés eliminar este barbero?"
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
        />

        <Toast message={toast} show={!!toast} onClose={() => setToast("")} />
        
      </motion.div>
    </div>
    
  );
}

export default AdminPanel;