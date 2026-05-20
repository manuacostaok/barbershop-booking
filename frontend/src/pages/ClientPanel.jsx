import { useEffect, useState } from "react";
import api from "../api";

function ClientPanel() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await api.get("/auth/me");
        setUser(userRes.data);

        const apptRes = await api.get("/appointments/my");
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
      await api.post("/auth/redeem", { service });

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
    <div className="page">

      <h1>👤 Mi perfil</h1>

      {/* INFO */}
      <div className="card">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <p>📞 {user.phone}</p>
      </div>

      {/* =========================
          📅 PRÓXIMO TURNO
      ========================= */}
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

      {/* =========================
          🔎 FILTROS
      ========================= 
      <div className="filters">
        <button onClick={() => setFilter("all")}>Todos</button>
        <button onClick={() => setFilter("confirmed")}>Confirmados</button>
        <button onClick={() => setFilter("cancelled")}>Cancelados</button>
      </div>
 */}
     
      {/* =========================
          🎁 RECOMPENSAS
      ========================= */}
      <div className="section">
        <h2>🎁 Beneficios</h2>

        {Object.keys(serviceCount).length === 0 ? (
          <p>No tenés historial todavía</p>
        ) : (
          <div className="grid">

            {Object.entries(serviceCount).map(([service, count]) => {
              const progress = count % 5;
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
                        onClick={() => redeemCut(service)}
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

      {/* =========================
          📜 HISTORIAL
      ========================= */}
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

    </div>
  );
}

export default ClientPanel;