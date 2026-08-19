import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarDay,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaUserTie,
  FaCut,
  FaChevronRight,
} from "react-icons/fa";

function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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
        console.error("error dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const todayAppointments = appointments.filter(
    (a) => a.date === today && a.status !== "cancelled"
  );

  const pending = appointments.filter((a) => a.status === "pending").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  const stats = [
    { label: "Turnos hoy", value: todayAppointments.length, icon: <FaCalendarDay />, tone: "primary" },
    { label: "Pendientes", value: pending, icon: <FaHourglassHalf />, tone: "warning" },
    { label: "Completados", value: completed, icon: <FaCheckCircle />, tone: "success" },
    { label: "Cancelados", value: cancelled, icon: <FaTimesCircle />, tone: "danger" },
    { label: "Profesionales", value: barbers.length, icon: <FaUserTie />, tone: "neutral" },
    { label: "Servicios", value: services.length, icon: <FaCut />, tone: "neutral" },
  ];

  const quickLinks = [
    { label: "Ver turnos", desc: "Agenda completa del local", path: "/admin/appointments" },
    { label: "Gestión de barberos y servicios", desc: "Altas, bajas y precios", path: "/admin/management" },
    { label: "Estadísticas", desc: "Rendimiento del negocio", path: "/admin/stats" },
    { label: "Configuración", desc: "Horarios y datos del local", path: "/admin/config" },
  ];

  return (
    <div className="section admin-dashboard">
      <div className="section-title">Dashboard</div>

      <div className="stat-grid">
        {stats.map((s, i) => (
          <div className={`stat-card tone-${s.tone}`} key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-value">{loading ? "—" : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title" style={{ marginTop: 32 }}>
        Accesos rápidos
      </div>

      <div className="quicklink-grid">
        {quickLinks.map((q, i) => (
          <div
            className="quicklink-card"
            key={i}
            onClick={() => navigate(q.path)}
          >
            <div>
              <div className="quicklink-title">{q.label}</div>
              <div className="quicklink-desc">{q.desc}</div>
            </div>
            <FaChevronRight className="quicklink-arrow" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
