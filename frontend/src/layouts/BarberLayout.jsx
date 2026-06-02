import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

import { FaCalendar, FaClock, FaUser } from "react-icons/fa";

export default function BarberLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔥 ESTADO GLOBAL (CLAVE)
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleToggle = () => {
      setSidebarOpen(prev => !prev);
    };

    window.addEventListener("toggleSidebar", handleToggle);
    return () => window.removeEventListener("toggleSidebar", handleToggle);
  }, []);

  // 🔥 FETCH GLOBAL
  const fetchAppointments = async () => {
    try {
      const res = await api.get(`/appointments/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setAppointments(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 🔥 SIDEBAR ITEMS
  const items = [
    { label: "Turnos", path: "/barber", icon: <FaCalendar /> },
    { label: "Hoy", path: "/barber/today", icon: <FaClock /> },
    { label: "Perfil", path: "/barber/profile", icon: <FaUser /> },
  ];

  return (
    <div className="admin-layout">

      <Sidebar
        items={items}
        title="Barbero"
        basePath="/barber"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-content">
        <Outlet
          context={{
            appointments,
            loading,
            fetchAppointments, // 🔥 CLAVE PARA REFRESH
          }}
        />
      </div>

      <div
        className={`overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  );
}