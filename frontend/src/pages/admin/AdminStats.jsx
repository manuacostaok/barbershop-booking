import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import Calendar from "react-calendar";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";

const PERIODS = [
  { id: "day", label: "Día" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
  { id: "year", label: "Año" },
];

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatDate(date) {
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
}

// Devuelve el rango [start,end] (strings YYYY-MM-DD, inclusive) y una
// etiqueta legible, según el período elegido y una fecha ancla.
function getRange(period, anchor) {
  const d = new Date(anchor);

  if (period === "day") {
    const s = formatDate(d);
    return { start: s, end: s, label: s };
  }

  if (period === "week") {
    const day = d.getDay(); // 0=domingo
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: formatDate(monday),
      end: formatDate(sunday),
      label: `${formatDate(monday)} al ${formatDate(sunday)}`,
    };
  }

  if (period === "month") {
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return {
      start: formatDate(first),
      end: formatDate(last),
      label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    };
  }

  // year
  const first = new Date(d.getFullYear(), 0, 1);
  const last = new Date(d.getFullYear(), 11, 31);
  return {
    start: formatDate(first),
    end: formatDate(last),
    label: `${d.getFullYear()}`,
  };
}

function shiftAnchor(period, anchor, dir) {
  const d = new Date(anchor);
  if (period === "day") d.setDate(d.getDate() + dir);
  if (period === "week") d.setDate(d.getDate() + dir * 7);
  if (period === "month") d.setMonth(d.getMonth() + dir);
  if (period === "year") d.setFullYear(d.getFullYear() + dir);
  return d;
}

function AdminStats() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);

  const [period, setPeriod] = useState("month");
  const [anchor, setAnchor] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/appointments/all"), api.get("/services")])
      .then(([a, s]) => {
        setAppointments(a.data);
        setServices(s.data);
      })
      .catch((err) => console.log("error stats", err));
  }, []);

  const getPrice = (serviceName) => {
    const service = services.find((s) => s.name === serviceName);
    return service ? service.price : 0;
  };

  const range = useMemo(() => getRange(period, anchor), [period, anchor]);

  const inRange = (appt) => appt.date >= range.start && appt.date <= range.end;

  const periodAppointments = appointments.filter(
    (a) => inRange(a) && a.status !== "cancelled"
  );

  const cancelledCount = appointments.filter(
    (a) => inRange(a) && a.status === "cancelled"
  ).length;

  const totalAppointments = periodAppointments.length;

  const totalRevenue = periodAppointments.reduce(
    (acc, a) => acc + getPrice(a.service),
    0
  );

  const avgTicket = totalAppointments ? totalRevenue / totalAppointments : 0;

  // POR BARBERO — turnos + ingresos, para poder calcular sueldos/comisiones
  const byBarber = {};
  periodAppointments.forEach((appt) => {
    const name = appt.barber?.name || "Sin nombre";
    const price = getPrice(appt.service);
    if (!byBarber[name]) byBarber[name] = { count: 0, revenue: 0 };
    byBarber[name].count += 1;
    byBarber[name].revenue += price;
  });

  // POR SERVICIO
  const byService = {};
  periodAppointments.forEach((appt) => {
    const price = getPrice(appt.service);
    if (!byService[appt.service]) byService[appt.service] = { count: 0, revenue: 0 };
    byService[appt.service].count += 1;
    byService[appt.service].revenue += price;
  });

  const money = (n) => `$${n.toLocaleString("es-AR")}`;

  return (
    <div className="section">

      <div className="page-header">
        <h2>Estadísticas</h2>
      </div>

      {/* SELECTOR DE PERÍODO */}
      <div className="stats-period-tabs">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            className={`stats-period-tab ${period === p.id ? "active" : ""}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* NAVEGACIÓN DE FECHA */}
      <div className="stats-date-nav">
        <button className="date-strip-arrow" onClick={() => setAnchor(shiftAnchor(period, anchor, -1))}>
          <FaChevronLeft />
        </button>

        <button className="stats-date-label" onClick={() => setShowCalendar(!showCalendar)}>
          <FaCalendarAlt /> {range.label}
        </button>

        <button className="date-strip-arrow" onClick={() => setAnchor(shiftAnchor(period, anchor, 1))}>
          <FaChevronRight />
        </button>
      </div>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="calendar-wrapper"
          >
            <Calendar
              value={anchor}
              onChange={(date) => {
                setAnchor(date);
                setShowCalendar(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESUMEN */}
      <div className="stat-grid" style={{ marginTop: 20 }}>
        <div className="stat-card tone-primary">
          <div>
            <div className="stat-value">{totalAppointments}</div>
            <div className="stat-label">Turnos</div>
          </div>
        </div>

        <div className="stat-card tone-success">
          <div>
            <div className="stat-value">{money(totalRevenue)}</div>
            <div className="stat-label">Ingresos</div>
          </div>
        </div>

        <div className="stat-card tone-danger">
          <div>
            <div className="stat-value">{cancelledCount}</div>
            <div className="stat-label">Cancelados</div>
          </div>
        </div>

        <div className="stat-card tone-neutral">
          <div>
            <div className="stat-value">{money(Math.round(avgTicket))}</div>
            <div className="stat-label">Ticket promedio</div>
          </div>
        </div>
      </div>

      {/* BARBEROS — pensado para calcular sueldos/comisiones */}
      <div className="section-title" style={{ marginTop: 32 }}>
        Por profesional <span className="premium-tag">Premium</span>
      </div>
      <p className="stats-hint">Turnos realizados e ingresos generados por cada profesional en el período.</p>

      {Object.keys(byBarber).length === 0 ? (
        <div className="empty-state"><p>Sin turnos en este período</p></div>
      ) : (
        <div className="payroll-table">
          <div className="payroll-row payroll-header">
            <div>Profesional</div>
            <div>Turnos</div>
            <div>Ingresos generados</div>
          </div>
          {Object.entries(byBarber)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .map(([name, data]) => (
              <div className="payroll-row" key={name}>
                <div>{name}</div>
                <div>{data.count}</div>
                <div>{money(data.revenue)}</div>
              </div>
            ))}
        </div>
      )}

      {/* SERVICIOS */}
      <div className="section-title" style={{ marginTop: 32 }}>Por servicio</div>

      {Object.keys(byService).length === 0 ? (
        <div className="empty-state"><p>Sin turnos en este período</p></div>
      ) : (
        <div className="grid">
          {Object.entries(byService)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .map(([name, data]) => (
              <div className="card" key={name}>
                <h3>{name}</h3>
                <p>{data.count} turnos · {money(data.revenue)}</p>
              </div>
            ))}
        </div>
      )}

    </div>
  );
}

export default AdminStats;
