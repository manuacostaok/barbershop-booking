import { useState, useEffect } from "react";
import api from "../api";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  FaCut,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaSignInAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import LoginModal from "../components/LoginModal";

function Booking() {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");

  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (date) => {
    const d = new Date(date);
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  };

  // 🔥 cargar datos
  useEffect(() => {
    api
      .get("/users/barbers")
      .then((res) => setBarbers(res.data))
      .catch(() => setToast("Error cargando barberos"));

    api
      .get("/services")
      .then((res) => setServices(res.data))
      .catch(() => setToast("Error cargando servicios"));
  }, []);

  // 🔥 disponibilidad automática
  useEffect(() => {
    if (selectedBarber && date) {
      getAvailability();
    }
  }, [selectedBarber, date]);

  const getAvailability = async () => {
    setLoading(true);

    try {
      const res = await api.get(
        `/appointments/availability?date=${formatDate(date)}&barber=${selectedBarber._id}`
      );
      setSlots(res.data.available);
    } catch {
      setToast("Error cargando disponibilidad");
    }

    setLoading(false);
  };

  const createAppointment = async () => {
    if (!selectedService)
      return setToast("Seleccioná un servicio ✂️");

    if (!selectedBarber)
      return setToast("Seleccioná un barbero 🧔");

    if (!selectedTime)
      return setToast("Elegí un horario ⏱️");

    if (!name)
      return setToast("Ingresá tu nombre 👤");

    try {
      await api.post("/appointments", {
        clientName: name,
        service: selectedService.name,
        date: formatDate(date),
        time: selectedTime,
        duration: selectedService.duration,
        barber: selectedBarber._id,
      });

      setToast("Turno reservado con éxito 🔥");

      setSelectedTime("");
      setName("");
    } catch (err) {
      setToast(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container">
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >

        {/* 🔥 HEADER PRO */}
        <div className="booking-header">
          <div className="title booking-title">
            💈✂ Barber Studio
          </div>

          {/* 🔥 BOTÓN LOGIN */}
          <button
            className="login-btn"
            onClick={() => setShowLogin(true)}
          >
            <FaSignInAlt /> Login
            <LoginModal
              open={showLogin}
              onClose={() => setShowLogin(false)}
            />
          </button>
        </div>

        {/* ✂️ SERVICIOS */}
        <div className="section">
          <div className="section-title">
            <FaCut /> Elegí tu servicio
          </div>

          <div className="services">
            {services.map((s) => (
              <div
                key={s._id}
                className={`service card-service ${
                  selectedService?._id === s._id ? "active" : ""
                }`}
                onClick={() => setSelectedService(s)}
              >
                <div className="service-name">{s.name}</div>
                <div className="service-price">${s.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 🧔 BARBEROS */}
        <div className="section">
          <div className="section-title">
            <FaUser /> Elegí barbero
          </div>

          <div className="services barbers">
            {barbers.map((b) => (
              <div
                key={b._id}
                className={`barber-card ${
                  selectedBarber?._id === b._id ? "active" : ""
                }`}
                onClick={() => setSelectedBarber(b)}
              >
                <img
                  src={b.avatar || "https://i.pravatar.cc/100"}
                  alt={b.name}
                />
                <span>{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📅 FECHA */}
        <div className="section">
          <div className="section-title">
            <FaCalendarAlt /> Elegí fecha
          </div>

          <button
            className="calendar-toggle"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            📅 {formatDate(date)}
          </button>

          {showCalendar && (
            <div className="calendar-dropdown">
              <Calendar
                value={date}
                onChange={(d) => {
                  setDate(d);
                  setShowCalendar(false);
                }}
              />
            </div>
          )}
        </div>

        {/* ⏱️ HORARIOS */}
        {selectedBarber && (
          <div className="section">
            <div className="section-title">
              <FaClock /> Horarios disponibles
            </div>

            {loading ? (
              <p>Cargando...</p>
            ) : (
              <div className="slots">
                {slots.map((slot) => (
                  <div
                    key={slot}
                    className={`slot ${
                      selectedTime === slot ? "active" : ""
                    }`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 👤 NOMBRE */}
        <div className="section">
          <div className="section-title">
            <FaUser /> Tus datos
          </div>

          <input
            className="input"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* 🚀 BOTÓN */}
        <button className="button" onClick={createAppointment}>
          Reservar turno 🚀
        </button>

        {/* 🔥 TOAST */}
        <Toast
          message={toast}
          show={!!toast}
          onClose={() => setToast("")}
        />
      </motion.div>
    </div>
  );
}

export default Booking;