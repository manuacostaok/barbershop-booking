import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);

  const navigate = useNavigate();

  // ----------------------
  // FETCH RESUMEN
  // ----------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [a, b, s] = await Promise.all([
          api.get("/appointments/all"),
          api.get("/users/barbers"),
          api.get("/services"),
        ]);

        setAppointments(a.data);
        setBarbers(b.data);
        setServices(s.data);
      } catch (err) {
        console.log("error dashboard", err);
      }
    };

    fetchData();
  }, []);

  // ----------------------
  // MÉTRICAS RÁPIDAS
  // ----------------------
  const today = new Date().toISOString().slice(0, 10);

  const todayAppointments = appointments.filter(
    (a) => a.date === today && a.status !== "cancelled"
  );

  const totalRevenue = todayAppointments.length * 0; // placeholder si no tenés price acá

  const pending = appointments.filter(
    (a) => a.status === "pending"
  ).length;

  const completed = appointments.filter(
    (a) => a.status === "completed"
  ).length;

  const cancelled = appointments.filter(
    (a) => a.status === "cancelled"
  ).length;

  return (
    <div className="section">

      <div className="section-title">📊 Dashboard Admin</div>

      {/* CARDS RESUMEN */}
      <div className="grid">

        <div className="card">
          <h3>📅 Turnos hoy</h3>
          <p>{todayAppointments.length}</p>
        </div>

        <div className="card">
          <h3>⏳ Pendientes</h3>
          <p>{pending}</p>
        </div>

        <div className="card">
          <h3>✔ Completados</h3>
          <p>{completed}</p>
        </div>

        <div className="card">
          <h3>❌ Cancelados</h3>
          <p>{cancelled}</p>
        </div>

        <div className="card">
          <h3>🧔 Barberos</h3>
          <p>{barbers.length}</p>
        </div>

        <div className="card">
          <h3>✂️ Servicios</h3>
          <p>{services.length}</p>
        </div>

      </div>
    <br />
      {/* ACCESOS RÁPIDOS */}
      <div className="section-title">🚀 Accesos rápidos</div>

      <div className="grid">

        <div
          className="card clickable"
          onClick={() => navigate("/admin/appointments")}
        >
          📅 Ver turnos
        </div>

        <div
          className="card clickable"
          onClick={() => navigate("/admin/management")}
        >
          🧔 Gestión barberos y servicios
        </div>

        <div
          className="card clickable"
          onClick={() => navigate("/admin/stats")}
        >
          📊 Estadísticas
        </div>

        <div
          className="card clickable"
          onClick={() => navigate("/admin/config")}
        >
          ⚙️ Configuración
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;