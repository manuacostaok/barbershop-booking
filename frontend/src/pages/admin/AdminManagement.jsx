import { useEffect, useState } from "react";
import api from "../../api";
import { FaEdit, FaTrash, FaClock, FaCamera, FaSpinner } from "react-icons/fa";
import BaseModal from "../../components/BaseModal";
import CreateBarberModal from "../../components/CreateBarberModal";
import { compressImage } from "../../utils/imageUpload";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const defaultSchedule = () =>
  Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    active: dayOfWeek >= 1 && dayOfWeek <= 6, // lunes a sábado por defecto
    start: "09:00",
    end: "18:00",
  }));

function AdminManagement() {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [toast, setToast] = useState("");
  const [uploadingServiceId, setUploadingServiceId] = useState(null);

  // CREATE
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState("barber");

  // EDIT BARBER
  const [editBarber, setEditBarber] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // CREATE INPUTS
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // EDIT INPUTS (SEPARADO 🔥)
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSchedule, setEditSchedule] = useState(defaultSchedule());

  // -----------------------
  // FETCH
  // -----------------------
  const fetchData = async () => {
    try {
      const [b, s] = await Promise.all([
        api.get("/users/barbers"),
        api.get("/services"),
      ]);

      setBarbers(b.data);
      setServices(s.data);
    } catch {
      setToast("Error cargando datos");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -----------------------
  // BARBER CRUD
  // -----------------------
  const createBarber = async () => {
    try {
      await api.post("/users/barbers", {
        name: newName,
        phone: newPhone,
        email: newEmail,
        password: newPassword,
      });

      setToast("Barbero creado");
      setShowCreate(false);
      fetchData();
    } catch {
      setToast("Error creando barbero");
    }
  };

  const openEditBarber = (b) => {
    setEditBarber(b);
    setEditName(b.name);
    setEditPhone(b.phone || "");
    setEditEmail(b.email || "");

    // si el barbero ya tiene horario cargado lo usamos, sino
    // arrancamos con un horario por defecto (lunes a sábado)
    if (b.schedule?.length === 7) {
      setEditSchedule(
        [...b.schedule].sort((a, c) => a.dayOfWeek - c.dayOfWeek)
      );
    } else {
      setEditSchedule(defaultSchedule());
    }
  };

  const updateScheduleDay = (dayOfWeek, changes) => {
    setEditSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...changes } : d))
    );
  };

  const updateBarber = async () => {
    try {
      await api.put(`/users/${editBarber._id}`, {
        name: editName,
        phone: editPhone,
        email: editEmail,
        schedule: editSchedule,
      });

      setToast("Barbero actualizado ✂️");
      setEditBarber(null);
      fetchData();
    } catch {
      setToast("Error actualizando");
    }
  };

  const deleteBarber = async () => {
    try {
      await api.delete(`/users/${editBarber._id}`);
      setToast("Barbero eliminado 🗑️");
      setEditBarber(null);
      setConfirmDelete(false);
      fetchData();
    } catch {
      setToast("Error eliminando");
    }
  };

  // -----------------------
  // SERVICES
  // -----------------------
  const createService = async () => {
    try {
      await api.post("/services", {
        name: newName,
        price: newPrice,
      });

      setToast("Servicio creado");
      setShowCreate(false);
      fetchData();
    } catch {
      setToast("Error servicio");
    }
  };

  const deleteService = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      setToast("Servicio eliminado");
      fetchData();
    } catch {
      setToast("Error eliminando");
    }
  };

  const uploadServiceImage = async (serviceId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingServiceId(serviceId);

    try {
      const dataUrl = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.8 });
      await api.put(`/services/${serviceId}/image`, { image: dataUrl });
      setToast("Imagen del servicio actualizada");
      fetchData();
    } catch (err) {
      setToast(err.response?.data?.message || err.message || "Error subiendo la imagen");
    } finally {
      setUploadingServiceId(null);
      e.target.value = "";
    }
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="section">

      <div className="page-header">
        <h2>Gestión</h2>
      </div>

      {/* BOTONES */}
      <div className="section-actions">
        <button className="button primary full" onClick={() => {
          setCreateType("barber");
          setShowCreate(true);
        }}>
          + Barbero
        </button>

        <button className="button primary full" onClick={() => {
          setCreateType("service");
          setShowCreate(true);
        }}>
          + Servicio
        </button>
      </div>

      {/* BARBEROS */}
      <h3 className="section-title" style={{ marginTop: 28 }}>Profesionales</h3>

      {barbers.length === 0 ? (
        <div className="empty-state"><p>Todavía no cargaste profesionales</p></div>
      ) : (
        <div className="grid">
          {barbers.map((b) => (
            <div key={b._id} className="card barber-manage-card">
              <div className="barber-edit" onClick={() => openEditBarber(b)}>
                <FaEdit />
              </div>

              <img src={b.avatar || "https://i.pravatar.cc/100"} />
              <p>{b.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* SERVICIOS */}
      <h3 className="section-title" style={{ marginTop: 28 }}>Servicios</h3>

      {services.length === 0 ? (
        <div className="empty-state"><p>Todavía no cargaste servicios</p></div>
      ) : (
        <div className="grid">
          {services.map((s) => (
            <div key={s._id} className="card service-manage-card">
              <label className="service-manage-thumb">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => uploadServiceImage(s._id, e)}
                />
                {s.image ? (
                  <img src={s.image} alt={s.name} />
                ) : (
                  <span className="service-manage-thumb-empty">
                    {uploadingServiceId === s._id ? <FaSpinner className="spin" /> : <FaCamera />}
                  </span>
                )}
              </label>

              <div className="service-manage-info">
                <p className="service-manage-name">{s.name}</p>
                <p className="service-manage-price">${s.price}</p>
              </div>

              <button className="delete-service-btn" onClick={() => deleteService(s._id)}>
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <CreateBarberModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createType === "barber" ? createBarber : createService}
        type={createType}
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

      {/* EDIT BARBER */}
      <BaseModal open={!!editBarber} onClose={() => setEditBarber(null)}>
        <h3>Editar barbero</h3>

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

        <div className="schedule-editor">
          <h4 className="schedule-editor-title"><FaClock /> Disponibilidad</h4>
          <p className="stats-hint" style={{ marginTop: -4 }}>
            Define los días y horarios en los que este profesional aparece disponible para reservar.
          </p>

          {editSchedule.map((day) => (
            <div key={day.dayOfWeek} className="schedule-day-row">
              <label className="schedule-day-toggle">
                <input
                  type="checkbox"
                  checked={day.active}
                  onChange={(e) =>
                    updateScheduleDay(day.dayOfWeek, { active: e.target.checked })
                  }
                />
                <span>{DAY_NAMES[day.dayOfWeek]}</span>
              </label>

              {day.active && (
                <div className="schedule-day-times">
                  <input
                    type="time"
                    className="input"
                    value={day.start}
                    onChange={(e) =>
                      updateScheduleDay(day.dayOfWeek, { start: e.target.value })
                    }
                  />
                  <span>a</span>
                  <input
                    type="time"
                    className="input"
                    value={day.end}
                    onChange={(e) =>
                      updateScheduleDay(day.dayOfWeek, { end: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="button danger full" style={{ marginTop: 16 }} onClick={() => setConfirmDelete(true)}>
          Eliminar barbero
        </button>
        <button className="button primary full" style={{ marginTop: 10 }} onClick={updateBarber}>
          Guardar cambios
        </button>
      </BaseModal>

      {/* CONFIRM DELETE */}
      <BaseModal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <h3>Confirmar eliminación</h3>
        <p>¿Seguro que querés eliminar a {editBarber?.name}? Esta acción no se puede deshacer.</p>

        <div className="modal-actions">
          <button className="button secondary" onClick={() => setConfirmDelete(false)}>Cancelar</button>
          <button className="button danger" onClick={deleteBarber}>Sí, eliminar</button>
        </div>
      </BaseModal>

      {toast && <div className="toast">{toast}</div>}

    </div>
  );
}

export default AdminManagement;