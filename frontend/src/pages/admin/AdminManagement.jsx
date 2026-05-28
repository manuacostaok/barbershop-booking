import { useEffect, useState } from "react";
import api from "../../api";
import { FaEdit, FaTrash } from "react-icons/fa";
import BaseModal from "../../components/BaseModal";
import CreateBarberModal from "../../components/CreateBarberModal";

function AdminManagement() {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [toast, setToast] = useState("");

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

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="section">

      <div className="section-title">⚙️ Gestión</div>

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
      <h3>🧔 Barberos</h3>

      <div className="grid">
        {barbers.map((b) => (
          <div key={b._id} className="card">
            <div className="barber-edit" onClick={() => openEditBarber(b)}>
                <FaEdit />
              </div>

            <img src={b.avatar || "https://i.pravatar.cc/100"} />
            <p>{b.name}</p>
          </div>
        ))}
      </div>

      {/* SERVICIOS */}
      <h3>✂️ Servicios</h3>

      <div className="grid">
        {services.map((s) => (
          <div key={s._id} className="card">
            <p>{s.name}</p>
            <p>${s.price}</p>

            <button className="delete-service-btn" onClick={() => deleteService(s._id)}>
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

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
        <button className="button primary full" onClick={() => setConfirmDelete(true)}>
          Eliminar
        </button>
        <button className="button primary full" onClick={updateBarber}>
          Guardar
        </button>
      </BaseModal>

      {/* CONFIRM DELETE */}
      <BaseModal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <p>¿Seguro que querés eliminar?</p>

        <button onClick={() => setConfirmDelete(false)}>Cancelar</button>
        <button onClick={deleteBarber}>Sí, eliminar</button>
      </BaseModal>

      {toast && <div className="toast">{toast}</div>}

    </div>
  );
}

export default AdminManagement;