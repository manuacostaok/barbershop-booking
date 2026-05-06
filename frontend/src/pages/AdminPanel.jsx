import { useEffect, useState } from "react";
import api from "../api";
import Calendar from "react-calendar";
import { AnimatePresence, motion } from "framer-motion";
import Toast from "../components/Toast";
import { FaTrash, FaHome, FaEdit, FaSignOutAlt, FaUndo, FaTimes } from "react-icons/fa";
import CreateBarberModal from "../components/CreateBarberModal";
import StatsCharts from "../components/StatsCharts";
import { useNavigate } from "react-router-dom";
import AppBrand from "../components/AppBrand";
import BaseModal from "../components/BaseModal";


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
  const [newPhone, setNewPhone] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [createType, setCreateType] = useState(null); // "barber" | "service"
  const [newPrice, setNewPrice] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [services, setServices] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const [editBarber, setEditBarber] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [editEmail, setEditEmail] = useState("");
  const [confirmDeleteBarber, setConfirmDeleteBarber] = useState(false);

 
  const [openBarber, setOpenBarber] = useState(false);

  const [availability, setAvailability] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState("");
  const [day, setDay] = useState(1);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const navigate = useNavigate();


  const getAvailability = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const res = await api.get(
        `/appointments/availability?date=${today}&barber=${selectedBarber}`
      );

      setAvailability(res.data.available); // 👈 slots reales
    } catch {
      setToast("Error cargando disponibilidad");
    }
  };

  const getAppointments = async () => {
    try {
      const res = await api.get(`/appointments/barber/${selectedBarber}`);
      setAppointments(res.data);
    } catch {
      setToast("Error cargando turnos");
    }
  };
  const openEditBarber = (barber) => {
    setEditBarber(barber);
    setEditName(barber.name);
    setEditPhone(barber.phone)
    setEditEmail(barber.email || "");
  };

  const updateBarber = async () => {
    try {
      await api.put(`/users/${editBarber._id}`, {
        name: editName,
        phone: editPhone,
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
      setNewPhone("");

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

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // o el endpoint real
    } catch (err) {
      console.log("logout error ignorado");
    }

    localStorage.clear();
    api.defaults.headers.common["Authorization"] = null;

    navigate("/");
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
    if (!selectedBarber) return;

    getAvailability();
    getAppointments();
  }, [selectedBarber]);

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
          phone: newPhone,
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
      setNewPhone("");

      setNewEmail("");
      setNewPassword("");
      setNewPrice("");

    } catch (err) {
      setToast(err.response?.data?.message || "Error creando");
    }
  };


  return (
    
    <div className="page">
        <div className="main-content">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >

        {/* HEADER */}
        

        {/* ============================= */}
        {/* 🔥 CREAR BARBERO / CORTE */}
        {/* ============================= */}

        


        <div className="section">
          <br />
          <div className="section-title">⚙️ Gestión</div>

          <div className="section-actions">
            <button
              className="button primary"
              onClick={() => {
                setCreateType("barber");
                setShowCreateModal(true);
              }}
            >
              + Crear barbero
              <span>🧔Nuevo profesional</span>
            </button>

            <button
              className="button secondary"
              onClick={() => {
                setCreateType("service");
                setShowCreateModal(true);
              }}
            >
              + Crear corte
              <span>✂️Nuevo corte</span>
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
          setPhone={setNewPhone}

          email={newEmail}
          setEmail={setNewEmail}
          password={newPassword}
          setPassword={setNewPassword}

          price={newPrice}
          setPrice={setNewPrice}
        />

        

        <div className="section">

        <div className="section-title">🧔 Barberos</div>

          <div className="grid">          {barbers.map((b) => (
            <div key={b._id} className="card">
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

          <div className="services-row">
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
        <div className="schedule-layout">

          {/* IZQUIERDA → TU FORM */}
          <div className="schedule-form">

            <div className="schedule-card light">

              <h2 className="section-title">⏰ Horarios</h2>

              {/* BARBER */}
              <div className="input-group">
                <label>Barbero</label>

                <div className="custom-select">
                  <div
                    className="select-trigger"
                    onClick={() => setOpenBarber(!openBarber)}
                  >
                    {selectedBarber
                      ? barbers.find(b => b._id === selectedBarber)?.name
                      : "Seleccionar barbero"}
                  </div>

                  {openBarber && (
                    <div className="select-dropdown">
                      {barbers.map((b) => (
                        <div
                          key={b._id}
                          className="select-option"
                          onClick={() => {
                            setSelectedBarber(b._id);
                            setOpenBarber(false);
                          }}
                        >
                          <img src={b.avatar || "https://i.pravatar.cc/40"} />
                          <span>{b.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* DAY */}
              <div className="input-group">
                <label>Día</label>

                <div className="day-grid">
                  {[
                    { label: "Lun", value: 1 },
                    { label: "Mar", value: 2 },
                    { label: "Mié", value: 3 },
                    { label: "Jue", value: 4 },
                    { label: "Vie", value: 5 },
                    { label: "Sáb", value: 6 },
                  ].map((d) => (
                    <button
                      key={d.value}
                      className={`day-pill ${day === d.value ? "active" : ""}`}
                      onClick={() => setDay(d.value)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TIME */}
              <div className="time-row">
                <div className="input-group">
                  <label>Desde</label>
                  <input
                    type="time"
                    className="input"
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Hasta</label>
                  <input
                    type="time"
                    className="input"
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                className="button primary full"
                onClick={async () => {
                  await api.post("/availability", {
                    barber: selectedBarber,
                    dayOfWeek: Number(day),
                    start,
                    end,
                  });

                  setToast("Horario guardado 🔥");
                  getAvailability();
                }}
              >
                Guardar horario
              </button>

            </div>

          </div>

          {/* DERECHA → LO NUEVO */}
          <div className="schedule-side">

            <SchedulePreview availability={availability} />

            <ScheduleOccupied appointments={appointments} />

            <ScheduleTips />

          </div>

        </div>

        <div className="section-title">📊 Estadísticas</div>

        {stats && <StatsCharts stats={stats} />}

        </div>

        

        {/* FILTROS */}
        <div className="filter-section">

          <div className="filter-header">
            🔎 Filtrar turnos
          </div>

          {/* STEP 1 - FECHA (NUEVO) */}
          <div className="filter-date-block">

            <div className="filter-date-label">
              📅 Fecha
            </div>

            <button
              className="filter-date-button"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <span className="filter-date-icon">📅</span>

              <span className="filter-date-text">
                {filterDate ? formatDate(filterDate) : "Seleccionar fecha"}
              </span>

              <span className="filter-date-chevron">▼</span>
            </button>

            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  className="filter-calendar-wrapper"
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

          {/* STEP 2 - BARBEROS (SIN CAMBIOS) */}
          <div className="filter-block barber-filter">
            <div className="filter-label">✂️ Barbero</div>

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
                  <img
                    src={b.avatar || "https://i.pravatar.cc/100"}
                    alt={b.name}
                  />
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3 - RESUMEN (SIN CAMBIOS) */}
          <div className="filter-summary">
            {filterDate || filterBarber ? (
              <span>
                Filtros activos:
                {filterDate && ` 📅 ${formatDate(filterDate)}`}
                {filterBarber && ` ✂️ ${barbers.find(b => b._id === filterBarber)?.name}`}
              </span>
            ) : (
              <span>Mostrando todos los turnos</span>
            )}
          </div>

        </div>

        {/* TURNOS */}
        <div className="section">
          <div className="section-title">📅 Lista turnos</div>

          {loading ? (
            <p>Cargando...</p>
          ) : filteredAppointments.length === 0 ? (
            <p>No hay turnos</p>
          ) : (
            <div className="admin-list">

              {/* 🔥 HEADER */}
              <div className="row header-row">
                <div>Nombre</div>
                <div>Servicio</div>
                <div>Barbero</div>
                <div>Fecha</div>
                <div>Hora</div>
                <div>Estado</div>
                
              </div>

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

                    <div className="actions">
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
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <BaseModal
          open={!!editBarber}
          onClose={() => setEditBarber(null)}
        >
          <div className="modal-content">
            <h3>Editar barbero ✂️</h3>

            <div className="avatar-editor">
              <div className="avatar-wrapper">
                <img
                  src={editBarber?.avatar || "https://i.pravatar.cc/100"}
                  alt="avatar"
                />

                <button className="avatar-edit-btn">
                  <FaEdit />
                </button>
              </div>

              <span className="avatar-hint">Cambiar imagen</span>
            </div>
            <input
              className="input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nombre"
            />

            <input
              className="input"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Teléfono"
            />

            <input
              className="input"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

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
        </BaseModal>
        <BaseModal
          open={confirmDeleteBarber}
          onClose={() => setConfirmDeleteBarber(false)}
        >
          <div className="modal-content">
            <p>¿Seguro que querés eliminar este barbero?</p>
          </div>

          <div className="modal-actions">
            <button
              className="button"
              onClick={() => setConfirmDeleteBarber(false)}
            >
              Cancelar
            </button>

            <button className="cancel-btn" onClick={deleteBarber}>
              Sí, eliminar
            </button>
          </div>
        </BaseModal>
        <BaseModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <div className="modal-content">
            <p>
              {actionType === "cancel"
                ? "¿Seguro que querés cancelar el turno?"
                : "¿Seguro que querés eliminar el turno?"}
            </p>
          </div>

          <div className="modal-actions">
            <button
              className="button"
              onClick={() => setModalOpen(false)}
            >
              Volver
            </button>

            <button className="cancel-btn" onClick={handleConfirm}>
              {actionType === "cancel" ? "Cancelar turno" : "Eliminar"}
            </button>
          </div>
        </BaseModal>

        <Toast message={toast} show={!!toast} onClose={() => setToast("")} />
        
      </motion.div>
      </div>
    </div>
    
  );
}

function SchedulePreview({ availability }) {
  const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

  return (
    <div className="card">
      <h3>📅 Horarios configurados</h3>

      {availability.length === 0 ? (
        <p>No hay horarios</p>
      ) : (
        availability.map((a, i) => (
          <div key={i} className="preview-row">
            <span>{days[a.dayOfWeek]}</span>
            <span>{a.start} - {a.end}</span>
          </div>
        ))
      )}
    </div>
  );
}

function ScheduleOccupied({ appointments }) {
  return (
    <div className="card">
      <h3>🔴 Turnos ocupados</h3>

      {appointments.length === 0 ? (
        <p>Sin turnos</p>
      ) : (
        appointments.slice(0, 5).map((a, i) => (
          <div key={i} className="preview-row">
            <span>{a.clientName}</span>
            <span>{a.time}</span>
          </div>
        ))
      )}
    </div>
  );
}

function ScheduleTips() {
  return (
    <div className="card">
      <h3>💡 Tips</h3>
      <ul>
        <li>No superponer horarios</li>
        <li>Usar bloques de 30 min</li>
        <li>Dejar descansos</li>
      </ul>
    </div>
  );
}

export default AdminPanel;