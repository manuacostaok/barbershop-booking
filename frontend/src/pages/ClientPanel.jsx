import { useEffect, useState } from "react";
import api from "../api";

function ClientPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.log("Error cargando usuario");
      }
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) return <p className="page">Cargando...</p>;

  if (!user) return <p className="page">No autenticado</p>;
    const redeemCut = async (service) => {
      try {
        await api.post("/auth/redeem", { service });

        setToast("Corte gratis usado 🎉");

        // refrescar usuario
        const res = await api.get("/auth/me");
        setUser(res.data);

      } catch (err) {
        setToast(err.response?.data?.message || "Error");
      }
    };
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
            🎁 RECOMPENSAS
        ========================= */}
        <div className="section">
          <h2>🎁 Beneficios</h2>

          {(() => {
            const serviceCount = {};

            user.appointmentsHistory?.forEach((appt) => {
              serviceCount[appt.service] =
                (serviceCount[appt.service] || 0) + 1;
            });

            if (Object.keys(serviceCount).length === 0) {
              return <p>No tenés historial todavía</p>;
            }

            

            return (
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
                              🎉 ¡Tenés un corte GRATIS!
                            </p>

                            <button
                              className="button"
                              onClick={() => redeemCut(service)}
                            >
                              Usar ahora
                            </button>
                          </>
                        ) : (
                        <p>
                          Te faltan {remaining} para uno gratis
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* =========================
            📜 HISTORIAL
        ========================= */}
        <div className="section">
          <h2>📜 Historial de turnos</h2>

          {user.appointmentsHistory?.length === 0 ? (
            <p>No tenés turnos todavía</p>
          ) : (
            <div className="grid">
              {user.appointmentsHistory.map((appt, i) => (
                <div key={i} className="card">
                  <h3>✂️ {appt.service}</h3>
                  <p>🧔 {appt.barber?.name || "Sin barbero"}</p>
                  <p>📅 {appt.date}</p>
                  <p>⏱️ {appt.time}</p>
                  <p>💲 ${appt.price || "-"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
}

export default ClientPanel;