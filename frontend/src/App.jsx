import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const services = [
  { name: "Corte", duration: 30 },
  { name: "Barba", duration: 30 },
  { name: "Corte + Barba", duration: 60 },
];

function App() {
  const [date, setDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const getAvailability = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/appointments/availability?date=${formatDate(date)}`
      );
      setSlots(res.data.available);
    } catch (err) {
      setSuccess("Error cargando disponibilidad");
    }
    setLoading(false);
  };

  const createAppointment = async () => {
    if (!selectedTime || !name || !selectedService) return;

    try {
      await axios.post("http://localhost:5000/api/appointments", {
        clientName: name,
        service: selectedService.name,
        date: formatDate(date),
        time: selectedTime,
        duration: selectedService.duration,
      });

      setSuccess("Turno reservado con éxito 🔥");
      setSelectedTime("");
      setName("");
      getAvailability();
    } catch (err) {
      setSuccess(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container">
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="title">Barber Booking</div>

        {/* 📅 CALENDARIO WRAPPER (ESTO ARREGLA CENTRADO) */}
        <div className="calendar-wrapper">
          <Calendar
            onChange={setDate}
            value={date}
            className="calendar"
          />
        </div>

        <button className="button" onClick={getAvailability}>
          {loading ? "Cargando..." : "Ver disponibilidad"}
        </button>

        {/* 🧴 SERVICIOS */}
        <div className="services">
          {services.map((s) => (
            <div
              key={s.name}
              className={`service ${
                selectedService?.name === s.name ? "active" : ""
              }`}
              onClick={() => setSelectedService(s)}
            >
              {s.name}
            </div>
          ))}
        </div>

        {/* ⏰ HORARIOS */}
        <div className="slots">
          {slots.map((slot) => (
            <div
              key={slot}
              className={`slot ${selectedTime === slot ? "active" : ""}`}
              onClick={() => setSelectedTime(slot)}
            >
              {slot}
            </div>
          ))}
        </div>

        <input
          className="input"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="button" onClick={createAppointment}>
          Reservar turno
        </button>

        {success && <div className="success">{success}</div>}
      </motion.div>
    </div>
  );
}

export default App;