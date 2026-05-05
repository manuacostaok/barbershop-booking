import { useState, useEffect } from "react";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  FaCut,
  FaUser,
  FaCalendarAlt,
  FaClock
} from "react-icons/fa";
import Toast from "../components/Toast";
import LoginModal from "../components/LoginModal";

function Booking() {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  const [date, setDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

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

  useEffect(() => {
    api.get("/users/barbers").then(res => setBarbers(res.data));
    api.get("/services").then(res => setServices(res.data));
  }, []);

  useEffect(() => {
    if (selectedBarber && date) getAvailability();
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
    if (!selectedService) return setToast("Seleccioná un servicio");
    if (!selectedBarber) return setToast("Seleccioná un barbero");
    if (!selectedTime) return setToast("Elegí un horario");
    if (!name) return setToast("Ingresá tu nombre");
    if (!phone) return setToast("Ingresá tu teléfono");

    try {
      const appointmentData = {
        service: selectedService,
        barber: selectedBarber,
        date: formatDate(date),
        time: selectedTime,
      };

      await api.post("/appointments", {
        clientName: name,
        clientPhone: phone,
        service: selectedService.name,
        date: formatDate(date),
        time: selectedTime,
        duration: selectedService.duration,
        barber: selectedBarber._id,
      });

      setConfirmedAppointment(appointmentData);
      setSuccess(true);

      // RESET LIMPIO
      setStep(1);
      setDate(new Date());
      setSelectedTime("");
      setSelectedService(null);
      setSelectedBarber(null);
      setName("");
      setPhone("");

    } catch (err) {
      setToast(err.response?.data?.message || "Error");
    }
  };

  if (success) {
    return (
      <div className="page center">
        <div className="card success">

          <h2>✅ Turno confirmado</h2>

          {confirmedAppointment && (
            <div className="success-details">
              <p>✂️ {confirmedAppointment.service.name}</p>
              <p>🧔 {confirmedAppointment.barber.name}</p>
              <p>📅 {confirmedAppointment.date}</p>
              <p>⏱️ {confirmedAppointment.time}</p>
            </div>
          )}

          <button
            className="button"
            onClick={() => {
              setSuccess(false);
              setConfirmedAppointment(null);
              setStep(1);
            }}
          >
            Reservar otro
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="page">

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />

      {/* LANDING */}
      <div className="landing small">
        <div className="landing-content">
          <h1>💈 Barber Studio</h1>
          <p>Reservá tu turno en segundos</p>

          <button
            className="cta"
            onClick={() =>
              document
                .getElementById("booking-section")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Reservar turno 🚀
          </button>
        </div>
      </div>

      {/* BOOKING */}
      <div id="booking-section" className="main-content">

        {/* PROGRESS */}
        <div className="progress">
          <div style={{ width: `${step * 20}%` }} />
        </div>

        {step > 1 && (
          <button className="back" onClick={() => setStep(step - 1)}>
            ← Volver
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >

            {/* STEP 1 */}
            {step === 1 && (
              <section className="section">
                <h2 className="section-title"><FaCut /> Servicios</h2>

                <div className="grid">
                  {services.map((s) => (
                    <div
                      key={s._id}
                      className="card"
                      onClick={() => {
                        setSelectedService(s);
                        setStep(2);
                      }}
                    >
                      <h3>{s.name}</h3>
                      <p>${s.price}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <section className="section">
                <h2 className="section-title"><FaUser /> Barberos</h2>

                <div className="grid">
                  {barbers.map((b) => (
                    <div
                      key={b._id}
                      className="card"
                      onClick={() => {
                        setSelectedBarber(b);
                        setStep(3);
                      }}
                    >
                      <img src={b.avatar || "https://i.pravatar.cc/100"} />
                      <p>{b.name}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <section className="section booking-split">

                <div>
                  <h2 className="section-title"><FaCalendarAlt /> Fecha</h2>

                  <Calendar value={date} onChange={(d) => setDate(d)} />
                </div>

                <div>
                  <h2 className="section-title"><FaClock /> Horarios</h2>

                  {loading ? (
                    <p>Cargando...</p>
                  ) : (
                    <div className="slots-grid">
                      {slots.map((slot) => (
                        <div
                          key={slot}
                          className={`slot ${selectedTime === slot ? "active" : ""}`}
                          onClick={() => {
                            setSelectedTime(slot);
                            setStep(4);
                          }}
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </section>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <section className="section">
                <h2 className="section-title">Datos</h2>

                <input
                  className="input"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  className="input"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <button className="button" onClick={createAppointment}>
                  Confirmar turno 🚀
                </button>
              </section>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      <Toast message={toast} show={!!toast} onClose={() => setToast("")} />
    </div>
  );
}

export default Booking;