import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api";
import BaseModal from "../../components/BaseModal";

export default function ClientBenefits() {
  const {
    serviceCount,
    config,
    setUser
  } = useOutletContext();

  const [redeemModal, setRedeemModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const redeemCut = async (service) => {
    await api.post("/auth/redeem", { service }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const userRes = await api.get("/auth/me");
    setUser(userRes.data);
  };

  return (
    <div className="page client-panel">
      <h1>🎁 Beneficios</h1>

      {!config?.loyaltyEnabled ? (
        <p>El sistema de premios no está activo</p>
      ) : Object.keys(serviceCount).length === 0 ? (
        <p>No tenés historial todavía</p>
      ) : (
        <div className="grid">
          {Object.entries(serviceCount).map(([service, count]) => {

            const cutsNeeded = config?.loyaltyCuts || 5;
            const progress = count % cutsNeeded;
            const remaining = cutsNeeded - progress;

            return (
              <div key={service} className="card">
                <h3>{service}</h3>

                <p>Cortes: {count}</p>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(progress / cutsNeeded) * 100}%`,
                    }}
                  />
                </div>

                {progress === 0 && count > 0 ? (
                  <>
                    <p style={{ color: "#00ff88" }}>
                      🎉 {config?.loyaltyReward || "Premio disponible"}
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
                  <p>Te faltan {remaining} para tu premio</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BaseModal open={redeemModal} onClose={() => setRedeemModal(false)}>
        <div className="confirm-modal">
          <h3>🎟️ Confirmar premio</h3>

          <p>
            Vas a usar tu beneficio en:
            <strong> {selectedService}</strong>
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