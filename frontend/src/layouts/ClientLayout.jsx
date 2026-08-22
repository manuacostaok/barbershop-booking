import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MobileTopbar from "../components/MobileTopbar";
import api from "../api";

import {
  FaUser,
  FaCalendar,
  FaGift,
  FaHistory,
} from "react-icons/fa";

export default function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile

  // 🔥 DATA GLOBAL
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const now = new Date();

  // 🔥 FETCH TODO
  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await api.get("/auth/me");
        setUser(userRes.data);

        const apptRes = await api.get("/appointments/my", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAppointments(apptRes.data);

        const configRes = await api.get("/config");
        setConfig(configRes.data);

      } catch (err) {
        console.log("Error cargando datos");
      }
      setLoading(false);
    };

    load();
  }, []);

  // 🔥 DERIVADOS
  // Solo contamos turnos COMPLETADOS (ya realizados) para la fidelización.
  // Antes contaba "confirmed" (agendado, todavía no atendido), lo que
  // permitía "ganar" el premio sin haberse hecho el servicio nunca.
  const serviceCount = {};
  appointments
    .filter((a) => a.status === "completed")
    .forEach((appt) => {
      serviceCount[appt.service] =
        (serviceCount[appt.service] || 0) + 1;
    });

  const nextAppointment = appointments
  .filter((a) => {
    // ❌ ignorar cancelados y completados
    if (a.status === "cancelled" || a.status === "completed") return false;

    // 🔥 comparar fecha + hora
    const apptDateTime = new Date(`${a.date}T${a.time}`);

    return apptDateTime >= now;
  })
  .sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  })[0];

  const items = [
    { label: "Perfil", path: "/client", icon: <FaUser /> },
    { label: "Próximo turno", path: "/client/next", icon: <FaCalendar /> },
    { label: "Beneficios", path: "/client/benefits", icon: <FaGift /> },
    { label: "Historial", path: "/client/history", icon: <FaHistory /> },
  ];

  if (loading) return <p className="page">Cargando...</p>;
  if (!user) return <p className="page">No autenticado</p>;

  return (
    <div className="admin-layout">

      <MobileTopbar onMenuClick={() => setSidebarOpen(true)} />

      {/* SIDEBAR */}
      <Sidebar
        items={items}
        title="Cliente"
        basePath="/client"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* CONTENIDO */}
      <div className="admin-content">
        <Outlet
          context={{
            user,
            appointments,
            config,
            serviceCount,
            nextAppointment,
            baseUrl,
            setUser
          }}
        />
      </div>

      {/* OVERLAY MOBILE */}
      <div
        className={`overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  );
}