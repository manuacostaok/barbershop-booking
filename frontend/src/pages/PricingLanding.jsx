import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  FaCut,
  FaCalendarCheck,
  FaMobileAlt,
  FaChartLine,
  FaWhatsapp,
  FaCheck,
  FaShieldAlt,
  FaGift,
  FaEye,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import { SiMercadopago } from "react-icons/si";

const PLANS = [
  {
    id: "basico",
    label: "Básico",
    price: 19999,
    tagline: "Para un negocio con un solo local",
    features: [
      "Reservas online ilimitadas",
      "1 profesional",
      "Recordatorios por email",
      "Panel de turnos",
      "Hosting y base de datos incluidos",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    price: 32999,
    highlighted: true,
    tagline: "El más elegido por negocios con equipo",
    features: [
      "Todo lo del plan Básico",
      "Hasta 5 profesionales",
      "Estadísticas de facturación",
      "Cupones y beneficios para clientes",
    ],
  },
  {
    id: "premium",
    label: "Premium",
    price: 54999,
    tagline: "Para cadenas y locales de alto volumen",
    features: [
      "Todo lo del plan Pro",
      "Profesionales ilimitados",
      "Múltiples locales",
      "Recordatorios por WhatsApp*",
      "Estadísticas por día, semana, mes y año",
      "Rendimiento e ingresos por profesional (para pagar sueldos/comisiones)",
      "Soporte prioritario",
      "Personalización de marca",
    ],
  },
];

const money = (n) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

function PricingLanding() {
  const navigate = useNavigate();
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
            <FaCut /> Turnos Ahora · Automatización para tu negocio
          </span>
          <h1>
            El sistema de turnos que <span className="highlight">trabaja solo</span>
          </h1>
          <p>
            Reservas online, recordatorios automáticos, fidelización de clientes y estadísticas de tu negocio —
            todo se automatiza solo. Barberías, peluquerías, manicura, spas y más.
            Vos atendé, Turnos Ahora se encarga del resto.
          </p>
          <div className="saas-hero-cta">
            <a href="#planes" className="button primary">
              Ver planes
            </a>
            <button className="button saas-demo-btn" onClick={() => navigate("/")}>
              <FaEye /> Ver cómo se vería tu página
            </button>
          </div>

          <span className="saas-hero-note">
            <SiMercadopago /> Pagás con Mercado Pago · Cancelás cuando quieras
          </span>

          <div className="saas-niches">
            {["Barberías", "Peluquerías", "Manicura", "Spas", "Estética"].map((n) => (
              <span key={n} className="saas-niche-pill">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="saas-features">
        <h2 className="section-title">Automatizamos todo lo que se pueda automatizar</h2>
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
            <FaGift className="saas-feature-icon" />
            <h3>Fidelización automática</h3>
            <p>El sistema cuenta los cortes de cada cliente solo y genera el premio cuando corresponde. Vos solo lo validás.</p>
          </div>
          <div className="saas-feature-card">
            <FaChartLine className="saas-feature-icon" />
            <h3>Estadísticas claras</h3>
            <p>Vas a saber cuánto facturaste, qué servicio se pide más y quién es tu profesional top.</p>
          </div>
          <div className="saas-feature-card">
            <FaMobileAlt className="saas-feature-icon" />
            <h3>100% mobile</h3>
            <p>Vos y tus clientes lo usan cómodo desde el celular, sin instalar nada.</p>
          </div>
        </div>
      </section>

      {/* DEMO — maqueta del panel real, para vender mostrando el producto */}
      <section className="saas-demo-section">
        <h2 className="section-title">Así se ve tu panel</h2>
        <p className="saas-pricing-sub">
          Turnos de hoy de un vistazo y estadísticas reales para tomar decisiones — no una planilla de Excel.
        </p>

        <div className="demo-browser-frame">
          <div className="demo-browser-topbar">
            <span className="demo-browser-dot red" />
            <span className="demo-browser-dot yellow" />
            <span className="demo-browser-dot green" />
            <span className="demo-browser-url">tunegocio.turnosahora.com/admin/stats</span>
          </div>

          <div className="demo-browser-body">
            <div className="demo-mini-sidebar">
              <span className="demo-mini-sidebar-icon"><FaCalendarCheck /></span>
              <span className="demo-mini-sidebar-icon"><FaUsers /></span>
              <span className="demo-mini-sidebar-icon active"><FaChartLine /></span>
              <span className="demo-mini-sidebar-icon"><FaCog /></span>
            </div>

            <div className="demo-main">
              <div className="demo-stats-tabs">
                <span className="demo-stats-tab">Día</span>
                <span className="demo-stats-tab">Semana</span>
                <span className="demo-stats-tab active">Mes</span>
                <span className="demo-stats-tab">Año</span>
              </div>

              <div className="stat-grid demo-stat-grid">
                <div className="stat-card tone-primary">
                  <div>
                    <div className="stat-value">24</div>
                    <div className="stat-label">Turnos</div>
                  </div>
                </div>
                <div className="stat-card tone-success">
                  <div>
                    <div className="stat-value">$187.500</div>
                    <div className="stat-label">Ingresos</div>
                  </div>
                </div>
                <div className="stat-card tone-danger">
                  <div>
                    <div className="stat-value">2</div>
                    <div className="stat-label">Cancelados</div>
                  </div>
                </div>
                <div className="stat-card tone-neutral">
                  <div>
                    <div className="stat-value">$7.800</div>
                    <div className="stat-label">Ticket promedio</div>
                  </div>
                </div>
              </div>

              <div className="payroll-table demo-payroll-table">
                <div className="payroll-row payroll-header">
                  <div>Profesional</div>
                  <div>Turnos</div>
                  <div>Ingresos</div>
                </div>
                <div className="payroll-row">
                  <div>Martín Pérez</div>
                  <div>12</div>
                  <div>$93.000</div>
                </div>
                <div className="payroll-row">
                  <div>Sofía Gómez</div>
                  <div>8</div>
                  <div>$62.400</div>
                </div>
                <div className="payroll-row">
                  <div>Lucas Díaz</div>
                  <div>4</div>
                  <div>$31.200</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="saas-demo-disclaimer">*Datos de ejemplo — así se ve con la información real de tu negocio.</p>
      </section>

      {/* PRICING */}
      <section className="saas-pricing" id="planes">
        <h2 className="section-title">Planes simples, sin letra chica</h2>
        <p className="saas-pricing-sub">
          Cancelás cuando quieras. Sin permanencia mínima. El precio incluye tu hosting,
          base de datos y dominio propio — no pagás infraestructura aparte.
        </p>

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

        <p className="saas-whatsapp-note">
          *Los mensajes de WhatsApp tienen un costo por envío cobrado por el proveedor (Twilio/Meta),
          independiente de tu suscripción. Se factura por uso según mensajes enviados ese mes.
        </p>
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
                    placeholder="Nombre de tu negocio"
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
