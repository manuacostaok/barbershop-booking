import { useEffect, useState } from "react";
import api from "../api";
import QRCode from "react-qr-code";
import BaseModal from "../components/BaseModal";

function ClientPanel() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [couponUsed, setCouponUsed] = useState(null);

  // 🔥 NUEVOS
  const [redeemModal, setRedeemModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

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
      } catch (err) {
        console.log("Error cargando datos");
      }
      setLoading(false);
    };

    load();
  }, []);

  const redeemCut = async (service) => {
    try {
      const res = await api.post("/auth/redeem", { service }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setCouponUsed(res.data.coupon);

      const userRes = await api.get("/auth/me");
      setUser(userRes.data);
    } catch (err) {
      console.log(err.response?.data?.message || "Error");
    }
  };

  if (loading) return <p className="page">Cargando...</p>;
  if (!user) return <p className="page">No autenticado</p>;

  const serviceCount = {};

  appointments.forEach((appt) => {
    serviceCount[appt.service] =
      (serviceCount[appt.service] || 0) + 1;
  });

  const filteredAppointments = appointments.filter((a) => {
    if (filter === "all") return true;
    if (filter === "confirmed") return a.status === "confirmed";
    if (filter === "cancelled") return a.status === "cancelled";
    return true;
  });

  const nextAppointment = appointments
    .filter((a) => a.status !== "cancelled")
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <div className="page client-panel">

      <h1>👤 Mi perfil</h1>

      {/* 🔥 CUPÓN MOSTRADO */}
      {couponUsed && (
        <div className="coupon-proof">
          <h2>🎟️ Corte GRATIS aplicado</h2>

          <p><strong>Cliente:</strong> {couponUsed.user}</p>
          <p><strong>Servicio:</strong> {couponUsed.service}</p>

          <p><strong>Fecha:</strong></p>
          <p>{new Date(couponUsed.usedAt).toLocaleString()}</p>

          <p><strong>Código único:</strong></p>
          <div className="coupon-code">
            {couponUsed.code}
          </div>

          {/* 🔥 QR NIVEL DIOS */}
          <div style={{ marginTop: 20 }}>
            <QRCode
              value={JSON.stringify({
                code: couponUsed.code,
                user: couponUsed.user,
                service: couponUsed.service,
                usedAt: couponUsed.usedAt,
              })}
              size={140}
            />
          </div>

          <p>Cupones usados: {couponUsed.totalUsed}</p>

          <p>⏱️ Hora actual: {new Date().toLocaleTimeString()}</p>

          <span className="coupon-status">✔ Validado</span>
        </div>
      )}

      {/* INFO */}
      <div className="card">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <p>📞 {user.phone}</p>
      </div>

      <br />

      {/* PRÓXIMO TURNO */}
      {nextAppointment && (
        <div className="card highlight">
          <h2>📅 Próximo turno</h2>
          <p>✂️ {nextAppointment.service}</p>
          <p>🧔 {nextAppointment.barber?.name}</p>
          <p>📅 {nextAppointment.date}</p>
          <p>⏱️ {nextAppointment.time}</p>
          <span className={`status ${nextAppointment.status}`}>
            {nextAppointment.status}
          </span>
        </div>
      )}

      {/* BENEFICIOS const progress = count % 5; */}
      <div className="section">
        <h2>🎁 Beneficios</h2>

        {Object.keys(serviceCount).length === 0 ? (
          <p>No tenés historial todavía</p>
        ) : (
          <div className="grid">

            {Object.entries(serviceCount).map(([service, count]) => {
              const progress = 0;;
              const remaining = 5 - progress;

              return (
                <div key={service} className="card">
                  <h3>{service}</h3>

                  <p>Cortes: {count}</p>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(progress / 5) * 100}%`,
                      }}
                    />
                  </div>

                  {progress === 0 && count > 0 ? (
                    <>
                      <p style={{ color: "#00ff88" }}>
                        🎉 Corte GRATIS disponible
                      </p>

                      <button
                        className="button"
                        onClick={() => {
                          setSelectedService(service);
                          setRedeemModal(true);
                        }}
                      >
                        Usar ahora
                      </button>
                    </>
                  ) : (
                    <p>Te faltan {remaining} para uno gratis</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* HISTORIAL */}
      <div className="section">
        <h2>📜 Historial de turnos</h2>

        {filteredAppointments.length === 0 ? (
          <p>No tenés turnos</p>
        ) : (
          <div className="grid">

            {filteredAppointments.map((appt) => (
              <div key={appt._id} className="card">

                <h3>✂️ {appt.service}</h3>
                <p>🧔 {appt.barber?.name || "Sin barbero"}</p>
                <p>📅 {appt.date}</p>
                <p>⏱️ {appt.time}</p>

                <span className={`status ${appt.status}`}>
                  {appt.status}
                </span>

              </div>
            ))}

          </div>
        )}
      </div>

      {/* 🔥 MODAL CONFIRMAR CUPÓN */}
      <BaseModal open={redeemModal} onClose={() => setRedeemModal(false)}>
        <div className="confirm-modal">
          <h3>🎟️ Confirmar corte GRATIS</h3>

          <p>
            Vas a usar tu beneficio en:
            <strong> {selectedService}</strong>
          </p>

          <p style={{ color: "#ff9800" }}>
            ⚠️ Este cupón es único y no se puede reutilizar
          </p>

          <div className="modal-actions">
            <button onClick={() => setRedeemModal(false)}>
              Cancelar
            </button>

            <button
              className="danger"
              onClick={async () => {
                await redeemCut(selectedService);
                setRedeemModal(false);
              }}
            >
              Confirmar uso
            </button>
          </div>
        </div>
      </BaseModal>

    </div>
  );
}

export default ClientPanel;