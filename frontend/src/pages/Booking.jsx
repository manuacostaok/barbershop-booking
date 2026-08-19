import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCut,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaPhone,
  FaInstagram,
  FaSun,
  FaCloudSun,
  FaMoon,
  FaGift,
  FaStar,
} from "react-icons/fa";
import Toast from "../components/Toast";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

const STEPS = [
  { id: 1, label: "Servicio", icon: <FaCut /> },
  { id: 2, label: "Profesional", icon: <FaUser /> },
  { id: 3, label: "Fecha y hora", icon: <FaCalendarAlt /> },
  { id: 4, label: "Tus datos", icon: <FaCheck /> },
];

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function Booking() {
  const navigate = useNavigate();
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
  const [mail, setMail] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [config, setConfig] = useState(null);

  const [modal, setModal] = useState(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [user, setUser] = useState(null);
  const isClient = user?.role === "client";
  const [local, setLocal] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get("/reviews/public")
      .then((res) => setReviews(res.data))
      .catch(() => {});
  }, []);

  const stripRef = useRef(null);

  useEffect(() => {
    api.get("/local")
      .then(res => setLocal(res.data))
      .catch(() => {
        setLocal({
          name: "Mi Negocio",
          description: "Reservá tu turno en segundos",
        });
      });
  }, []);

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

  const getAvailability = async () => {
    setLoading(true);

    try {
      const res = await api.get(
        `/appointments/availability?date=${formatDate(date)}&barber=${selectedBarber?._id}`
      );

      let availableSlots = res.data.available;

      const now = new Date();
      const selectedDate = new Date(date);

      const isToday =
        now.getFullYear() === selectedDate.getFullYear() &&
        now.getMonth() === selectedDate.getMonth() &&
        now.getDate() === selectedDate.getDate();

      if (isToday) {
        const currentTime = now.getHours() * 60 + now.getMinutes();
        availableSlots = availableSlots.filter((slot) => {
          const [h, m] = slot.split(":").map(Number);
          return h * 60 + m > currentTime;
        });
      }

      if (config) {
        const [openH, openM] = config.open.split(":").map(Number);
        const [closeH, closeM] = config.close.split(":").map(Number);
        const openTime = openH * 60 + openM;
        const closeTime = closeH * 60 + closeM;

        availableSlots = availableSlots.filter((slot) => {
          const [h, m] = slot.split(":").map(Number);
          const slotTime = h * 60 + m;
          return slotTime >= openTime && slotTime <= closeTime;
        });
      }

      setSlots(availableSlots);
    } catch {
      setToast("Error cargando horarios");
    }

    setLoading(false);
  };

  useEffect(() => {
    api.get("/users/barbers").then(res => setBarbers(res.data));
    api.get("/services").then(res => setServices(res.data));
  }, []);

  useEffect(() => {
    api.get("/config")
      .then(res => setConfig(res.data))
      .catch(() => {
        setConfig({ open: "09:00", close: "23:00", interval: 30, hasBreak: false });
      });
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (storedUser) {
      setName(storedUser.name || "");
      setPhone(storedUser.phone || "");
      setMail(storedUser.email || "");
    }
  }, []);

  useEffect(() => {
    if (!selectedBarber || !config) return;
    getAvailability();
  }, [date, selectedBarber, config]);

  // -------- FECHAS (próximos 21 días, tira horizontal) --------
  const nextDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 21; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const scrollStrip = (dir) => {
    if (!stripRef.current) return;
    stripRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  // -------- HORARIOS AGRUPADOS POR FRANJA --------
  const groupedSlots = useMemo(() => {
    const groups = { Mañana: [], Tarde: [], Noche: [] };

    slots.forEach((slot) => {
      const [h] = slot.split(":").map(Number);
      if (h < 13) groups["Mañana"].push(slot);
      else if (h < 19) groups["Tarde"].push(slot);
      else groups["Noche"].push(slot);
    });

    return groups;
  }, [slots]);

  const periodIcon = { Mañana: <FaSun />, Tarde: <FaCloudSun />, Noche: <FaMoon /> };

  const createAppointment = async () => {
    if (!selectedService) return setToast("Seleccioná un servicio");
    if (!selectedBarber) return setToast("Seleccioná un profesional");
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
        clientName: user?.name || name,
        clientPhone: user?.phone || phone,
        clientEmail: user?.email || mail,
        service: selectedService.name,
        date: formatDate(date),
        time: selectedTime,
        duration: selectedService.duration,
        barber: selectedBarber._id,
      });

      setConfirmedAppointment(appointmentData);
      setSuccess(true);

      setStep(1);
      setDate(new Date());
      setSelectedTime("");
      setSelectedService(null);
      setSelectedBarber(null);

      if (!user) {
        setName("");
        setPhone("");
        setMail("");
      }
    } catch (err) {
      setToast(err.response?.data?.message || "Error");
    }
  };

  // ===================== SUCCESS SCREEN =====================
  if (success) {
    return (
      <div className="page center">
        <motion.div
          className="card success-card-v2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="success-check">
            <FaCheck />
          </div>

          <h2>¡Turno confirmado!</h2>
          <p className="success-sub">Te esperamos en la fecha y hora reservada.</p>

          {confirmedAppointment && (
            <div className="success-details-v2">
              <div className="success-detail-row">
                <FaCut /> <span>{confirmedAppointment.service.name}</span>
              </div>
              <div className="success-detail-row">
                <FaUser /> <span>{confirmedAppointment.barber.name}</span>
              </div>
              <div className="success-detail-row">
                <FaCalendarAlt /> <span>{confirmedAppointment.date}</span>
              </div>
              <div className="success-detail-row">
                <FaClock /> <span>{confirmedAppointment.time} hs</span>
              </div>
            </div>
          )}

          <button
            className="button primary full"
            onClick={() => {
              setSuccess(false);
              setConfirmedAppointment(null);
              setStep(1);
            }}
          >
            Reservar otro turno
          </button>
        </motion.div>
      </div>
    );
  }

  // ===================== MAIN =====================
  return (
    <div className="page">
      <LoginModal
        open={modal === "login"}
        onClose={() => setModal(null)}
        onOpenRegister={() => setModal("register")}
      />
      <RegisterModal
        open={modal === "register"}
        onClose={() => setModal(null)}
        onSuccess={() => setModal("login")}
      />

      {/* HERO ÚNICO */}
      <div className="hero">
        <img
          className="hero-bg"
          src={local?.coverImage || "https://picsum.photos/1600/600?random=studio"}
          alt="cover"
        />

        <div className="hero-overlay">
          <div className="hero-brand">
            <img
              className="hero-logo"
              src={local?.logo || "https://placehold.co/200x200/21e6b0/08080d?text=T"}
              alt="logo"
            />
          </div>

          <h1>{local?.name || "Mi Negocio"}</h1>
          <p>{local?.description || "Reservá tu turno online en segundos, sin llamadas ni esperas."}</p>

          <div className="hero-info">
            <span><FaMapMarkerAlt /> {local?.address || "San Miguel, Buenos Aires"}</span>
            <span><FaPhone /> {local?.phone || "+54 11 0000-0000"}</span>
            <span><FaInstagram /> @{local?.instagram || "tu_negocio"}</span>
            <span><FaClock /> {config?.open || "09:00"} - {config?.close || "22:00"}</span>
          </div>

          <button
            className="cta"
            onClick={() =>
              document.getElementById("booking-section").scrollIntoView({ behavior: "smooth" })
            }
          >
            Reservar turno
          </button>

          <div className="register-banner">
            <FaGift className="register-banner-icon" />
            {isClient ? (
              <>
                <div>
                  <strong>Ya sumás puntos en cada visita</strong>
                  <p>Revisá cuánto te falta para tu próximo premio de fidelidad.</p>
                </div>
                <button className="button primary" onClick={() => navigate("/client/benefits")}>
                  Ver mis beneficios
                </button>
              </>
            ) : (
              <>
                <div>
                  <strong>Registrate y sumá puntos en cada visita</strong>
                  <p>Cada corte cuenta para tu premio de fidelidad — creá tu cuenta gratis.</p>
                </div>
                <button className="button primary" onClick={() => setModal("register")}>
                  Registrarme
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* BOOKING WIZARD */}
      <div id="booking-section" className="main-content booking-wizard">

        {/* STEPPER */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s.id} className="stepper-item">
              <div
                className={`stepper-circle ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}
                onClick={() => step > s.id && setStep(s.id)}
              >
                {step > s.id ? <FaCheck /> : s.icon}
              </div>
              <span className="stepper-label">{s.label}</span>
              {i < STEPS.length - 1 && <div className={`stepper-line ${step > s.id ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        {step > 1 && (
          <button className="back" onClick={() => setStep(step - 1)}>
            <FaChevronLeft /> Volver
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >

            {/* STEP 1 — SERVICIOS */}
            {step === 1 && (
              <section className="section">
                <h2 className="section-title">Elegí un servicio</h2>

                <div className="service-grid-v2">
                  {services.map((s) => (
                    <div
                      key={s._id}
                      className={`service-card-v2 ${selectedService?._id === s._id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedService(s);
                        setStep(2);
                      }}
                    >
                      <div className="service-icon-v2"><FaCut /></div>
                      <div className="service-info-v2">
                        <h3>{s.name}</h3>
                        {s.duration && <span className="service-duration">{s.duration} min</span>}
                      </div>
                      <div className="service-price-v2">${s.price}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 2 — PROFESIONALES */}
            {step === 2 && (
              <section className="section">
                <h2 className="section-title">Elegí un profesional</h2>

                <div className="pro-grid-v2">
                  {barbers.map((b) => (
                    <div
                      key={b._id}
                      className={`pro-card-v2 ${selectedBarber?._id === b._id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedBarber(b);
                        setStep(3);
                      }}
                    >
                      <img src={b.avatar || "https://i.pravatar.cc/100"} />
                      <p>{b.name}</p>
                      {selectedBarber?._id === b._id && (
                        <span className="pro-check"><FaCheck /></span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 3 — FECHA + HORA */}
            {step === 3 && (
              <section className="section">
                <h2 className="section-title">Elegí fecha y horario</h2>

                <div className="date-strip-wrapper">
                  <button className="date-strip-arrow" onClick={() => scrollStrip(-1)}>
                    <FaChevronLeft />
                  </button>

                  <div className="date-strip" ref={stripRef}>
                    {nextDays.map((d) => {
                      const active = isSameDay(d, date);
                      return (
                        <button
                          key={d.toISOString()}
                          className={`date-pill ${active ? "active" : ""}`}
                          onClick={() => setDate(d)}
                        >
                          <span className="date-pill-day">{DAY_LABELS[d.getDay()]}</span>
                          <span className="date-pill-num">{d.getDate()}</span>
                          <span className="date-pill-month">{MONTH_LABELS[d.getMonth()]}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button className="date-strip-arrow" onClick={() => scrollStrip(1)}>
                    <FaChevronRight />
                  </button>
                </div>

                {loading ? (
                  <p className="slots-loading">Cargando horarios...</p>
                ) : slots.length === 0 ? (
                  <div className="empty-state">
                    <FaClock className="empty-icon" />
                    <p>No hay horarios disponibles para este día</p>
                  </div>
                ) : (
                  <div className="slots-by-period">
                    {Object.entries(groupedSlots).map(([period, times]) =>
                      times.length === 0 ? null : (
                        <div key={period} className="slot-period-group">
                          <div className="slot-period-title">
                            {periodIcon[period]} {period}
                          </div>
                          <div className="slots-grid-v2">
                            {times.map((slot) => (
                              <button
                                key={slot}
                                className={`slot-chip ${selectedTime === slot ? "active" : ""}`}
                                onClick={() => {
                                  setSelectedTime(slot);
                                  setStep(4);
                                }}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            )}

            {/* STEP 4 — DATOS + RESUMEN */}
            {step === 4 && (
              <section className="section step4-grid">
                <div>
                  <h2 className="section-title">Tus datos</h2>

                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      className="input"
                      placeholder="Nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!!user}
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      className="input"
                      placeholder="Teléfono"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!!user}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      className="input"
                      placeholder="Email"
                      value={mail}
                      onChange={(e) => setMail(e.target.value)}
                      disabled={!!user}
                    />
                  </div>

                  <button className="button primary full" onClick={createAppointment}>
                    Confirmar turno
                  </button>
                </div>

                <div className="booking-summary-card">
                  <h3>Resumen</h3>
                  <div className="summary-row"><FaCut /> <span>{selectedService?.name}</span></div>
                  <div className="summary-row"><FaUser /> <span>{selectedBarber?.name}</span></div>
                  <div className="summary-row"><FaCalendarAlt /> <span>{formatDate(date)}</span></div>
                  <div className="summary-row"><FaClock /> <span>{selectedTime} hs</span></div>
                  {selectedService?.price && (
                    <div className="summary-total">Total: ${selectedService.price}</div>
                  )}
                </div>
              </section>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* UBICACIÓN — siempre visible; si el admin no cargó
          dirección, mostramos el Obelisco (Bs As) como referencia */}
      <div className="main-content location-section">
        <h2 className="section-title">Cómo llegar</h2>
        <div className="location-map-wrapper">
          <iframe
            title="Ubicación del local"
            className="location-map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(local?.address || "Obelisco, Buenos Aires, Argentina")}&output=embed`}
          />
        </div>
        <a
          className="location-map-link"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local?.address || "Obelisco, Buenos Aires, Argentina")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaMapMarkerAlt /> Abrir en Google Maps
        </a>
      </div>

      {/* RESEÑAS — solo se muestran las positivas (4-5 estrellas) */}
      {reviews.length > 0 && (
        <div className="main-content reviews-section">
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>

          <div className="reviews-grid">
            {reviews.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} className={i < r.rating ? "filled" : ""} />
                  ))}
                </div>

                {r.comment && <p className="review-comment">"{r.comment}"</p>}

                <div className="review-author">
                  <span>{r.clientName}</span>
                  {r.barber?.name && <span className="review-barber">· con {r.barber.name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Toast message={toast} show={!!toast} onClose={() => setToast("")} />
    </div>
  );
}

export default Booking;
