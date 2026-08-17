import { useState } from "react";
import api from "../api";
import {
  FaCut,
  FaCalendarCheck,
  FaMobileAlt,
  FaChartLine,
  FaWhatsapp,
  FaCheck,
  FaShieldAlt,
} from "react-icons/fa";
import { SiMercadopago } from "react-icons/si";

const PLANS = [
  {
    id: "basico",
    label: "Básico",
    price: 14999,
    tagline: "Para una barbería con un solo local",
    features: [
      "Reservas online ilimitadas",
      "1 barbero",
      "Recordatorios por email",
      "Panel de turnos",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    price: 24999,
    highlighted: true,
    tagline: "El más elegido por barberías con equipo",
    features: [
      "Todo lo del plan Básico",
      "Hasta 5 barberos",
      "Recordatorios por WhatsApp",
      "Estadísticas de facturación",
      "Cupones y beneficios para clientes",
    ],
  },
  {
    id: "premium",
    label: "Premium",
    price: 39999,
    tagline: "Para cadenas y locales de alto volumen",
    features: [
      "Todo lo del plan Pro",
      "Barberos ilimitados",
      "Múltiples locales",
      "Soporte prioritario",
      "Personalización de marca",
    ],
  },
];

const money = (n) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

function PricingLanding() {
  const [modalPlan, setModalPlan] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", businessName: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const openCheckout = (planId) => {
    setResult(null);
    setError("");
    setModalPlan(planId);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email) {
      setError("Completá al menos tu nombre y email");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/subscriptions", { ...form, plan: modalPlan });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error procesando la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = PLANS.find((p) => p.id === modalPlan);

  return (
    <div className="saas-landing">
      {/* HERO */}
      <section className="saas-hero">
        <div className="saas-hero-inner">
          <span className="saas-badge">
            <FaCut /> Software para barberías
          </span>
          <h1>
            El sistema de turnos que tu barbería <span className="highlight">necesita</span>
          </h1>
          <p>
            Reservas online, recordatorios automáticos y estadísticas de tu negocio.
            Todo en un panel simple, pensado para barberos, no para programadores.
          </p>
          <div className="saas-hero-cta">
            <a href="#planes" className="button primary">
              Ver planes
            </a>
            <span className="saas-hero-note">
              <SiMercadopago /> Pagás con Mercado Pago · Cancelás cuando quieras
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="saas-features">
        <h2 className="section-title">Todo lo que necesitás para dejar de anotar turnos en un cuaderno</h2>
        <div className="saas-features-grid">
          <div className="saas-feature-card">
            <FaCalendarCheck className="saas-feature-icon" />
            <h3>Reservas 24/7</h3>
            <p>Tus clientes reservan solos desde el celular, sin llamarte ni escribirte.</p>
          </div>
          <div className="saas-feature-card">
            <FaWhatsapp className="saas-feature-icon" />
            <h3>Menos ausentes</h3>
            <p>Recordatorios automáticos que bajan el ausentismo a tus turnos.</p>
          </div>
          <div className="saas-feature-card">
            <FaChartLine className="saas-feature-icon" />
            <h3>Estadísticas claras</h3>
            <p>Vas a saber cuánto facturaste, qué corte se pide más y quién es tu barbero top.</p>
          </div>
          <div className="saas-feature-card">
            <FaMobileAlt className="saas-feature-icon" />
            <h3>100% mobile</h3>
            <p>Vos y tus clientes lo usan cómodo desde el celular, sin instalar nada.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="saas-pricing" id="planes">
        <h2 className="section-title">Planes simples, sin letra chica</h2>
        <p className="saas-pricing-sub">Cancelás cuando quieras. Sin permanencia mínima.</p>

        <div className="saas-pricing-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`saas-plan-card ${plan.highlighted ? "highlighted" : ""}`}
            >
              {plan.highlighted && <span className="saas-plan-tag">Más elegido</span>}
              <h3>{plan.label}</h3>
              <p className="saas-plan-tagline">{plan.tagline}</p>
              <div className="saas-plan-price">
                {money(plan.price)}
                <span>/mes</span>
              </div>
              <ul className="saas-plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <FaCheck /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`button ${plan.highlighted ? "primary" : ""} full`}
                onClick={() => openCheckout(plan.id)}
              >
                Suscribirme
              </button>
            </div>
          ))}
        </div>

        <div className="saas-security-note">
          <FaShieldAlt /> Pago procesado por Mercado Pago. No almacenamos datos de tarjetas.
        </div>
      </section>

      {/* FAQ */}
      <section className="saas-faq">
        <h2 className="section-title">Preguntas frecuentes</h2>
        <details>
          <summary>¿Necesito instalar algo?</summary>
          <p>No, funciona 100% desde el navegador, tanto para vos como para tus clientes.</p>
        </details>
        <details>
          <summary>¿Puedo cambiar de plan después?</summary>
          <p>Sí, podés subir o bajar de plan cuando quieras desde tu panel.</p>
        </details>
        <details>
          <summary>¿Cómo se cobra?</summary>
          <p>Con débito automático mensual a través de Mercado Pago, en pesos argentinos.</p>
        </details>
      </section>

      {/* MODAL CHECKOUT */}
      {modalPlan && (
        <div className="modal-backdrop" onClick={() => setModalPlan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!result ? (
              <>
                <h3>Suscribirte al plan {currentPlan?.label}</h3>
                <p className="saas-modal-price">
                  {money(currentPlan?.price || 0)} / mes
                </p>

                <form onSubmit={submit} className="saas-form">
                  <input
                    className="input"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Nombre de tu barbería"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Teléfono"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />

                  {error && <p className="saas-error">{error}</p>}

                  <button className="button primary full" disabled={loading}>
                    {loading ? "Procesando..." : (
                      <>
                        <SiMercadopago /> Continuar a Mercado Pago
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="saas-result">
                <h3>¡Listo, {form.name}! 🎉</h3>
                <p>
                  Registramos tu solicitud del plan <strong>{currentPlan?.label}</strong>.
                </p>
                <p className="saas-demo-note">
                  Este es un checkout de demostración — la conexión real con
                  Mercado Pago se activa cuando cargues tus credenciales.
                </p>
                <button className="button primary full" onClick={() => setModalPlan(null)}>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PricingLanding;
