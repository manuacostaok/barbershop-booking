import { useEffect, useState } from "react";
import api from "../../api";
import Calendar from "react-calendar";
import { motion, AnimatePresence } from "framer-motion";

function AdminStats() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);

  const [statsDate, setStatsDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    if (!(date instanceof Date)) date = new Date(date);
    if (isNaN(date)) return "";

    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  // FETCH
  const fetchData = async () => {
    try {
      const [a, s] = await Promise.all([
        api.get("/appointments/all"),
        api.get("/services"),
      ]);

      setAppointments(a.data);
      setServices(s.data);
    } catch (err) {
      console.log("error stats", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPrice = (serviceName) => {
    const service = services.find((s) => s.name === serviceName);
    return service ? service.price : 0;
  };

  const selectedDate = formatDate(statsDate);

  const selectedAppointments = appointments.filter(
    (a) => a.date === selectedDate && a.status !== "cancelled"
  );

  const cancelledSelected = appointments.filter(
    (a) => a.date === selectedDate && a.status === "cancelled"
  ).length;

  const totalSelected = selectedAppointments.length;

  const selectedRevenue = selectedAppointments.reduce((acc, appt) => {
    return acc + getPrice(appt.service);
  }, 0);

  // POR BARBERO
  const revenueByBarber = {};

  selectedAppointments.forEach((appt) => {
    const name = appt.barber?.name || "Sin nombre";
    const price = getPrice(appt.service);

    revenueByBarber[name] = (revenueByBarber[name] || 0) + price;
  });

  // POR SERVICIO
  const revenueByService = {};

  selectedAppointments.forEach((appt) => {
    const service = appt.service;
    const price = getPrice(service);

    revenueByService[service] = (revenueByService[service] || 0) + price;
  });

  // MES
  const month = selectedDate.slice(0, 7);

  const monthAppointments = appointments.filter(
    (a) => a.date.startsWith(month) && a.status !== "cancelled"
  );

  const monthRevenue = monthAppointments.reduce((acc, appt) => {
    return acc + getPrice(appt.service);
  }, 0);

  return (
    <div className="section">

      <div className="section-title">📊 Estadísticas</div>

      {/* FECHA */}
      <div className="card">
        <h3>Seleccionar fecha</h3>

        <button className="button primary full" onClick={() => setShowCalendar(!showCalendar)}>
          📅 {selectedDate}
        </button>
        <br />
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            className="calendar-wrapper"

            >
              <Calendar
                value={statsDate}
                onChange={(date) => {
                  setStatsDate(date);
                  setShowCalendar(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div><br />
      {/* RESUMEN */}
      <div className="grid">

        <div className="card">
          <h3>Turnos</h3>
          <p>{totalSelected}</p>
        </div>

        <div className="card">
          <h3>Ganancia</h3>
          <p>${selectedRevenue}</p>
        </div>

        <div className="card">
          <h3>Cancelados</h3>
          <p>{cancelledSelected}</p>
        </div>

        <div className="card">
          <h3>Mes</h3>
          <p>${monthRevenue}</p>
        </div>

      </div>
    <br />
      {/* BARBEROS */}
      <div className="section-title">🏆 Por barbero</div>

      <div className="grid">
        {Object.entries(revenueByBarber).map(([name, total]) => (
          <div className="card" key={name}>
            <h3>{name}</h3>
            <p>${total}</p>
          </div>
        ))}
      </div>

      {/* SERVICIOS */}
      <div className="section-title">💈 Por servicio</div>

      <div className="grid">
        {Object.entries(revenueByService).map(([name, total]) => (
          <div className="card" key={name}>
            <h3>{name}</h3>
            <p>${total}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default AdminStats;