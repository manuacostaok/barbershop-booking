import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api";
import BaseModal from "../../components/BaseModal";
import { FaGift, FaLock, FaCheckCircle } from "react-icons/fa";

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
      <div className="page-header">
        <h1>Beneficios</h1>
      </div>

      {!config?.loyaltyEnabled ? (
        <div className="empty-state">
          <FaLock className="empty-icon" />
          <p>El sistema de premios no está activo por ahora</p>
        </div>
      ) : Object.keys(serviceCount).length === 0 ? (
        <div className="empty-state">
          <FaGift className="empty-icon" />
          <p>Todavía no tenés historial para sumar beneficios</p>
        </div>
      ) : (
        <div className="grid">
          {Object.entries(serviceCount).map(([service, count]) => {

            const cutsNeeded = config?.loyaltyCuts || 5;
            const progress = count % cutsNeeded;
            const remaining = cutsNeeded - progress;
            const reward = progress === 0 && count > 0;

            return (
              <div key={service} className={`card benefit-card ${reward ? "reward-ready" : ""}`}>
                <h3>{service}</h3>
                <p className="benefit-count">{count} cortes realizados</p>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(progress / cutsNeeded) * 100}%`,
                    }}
                  />
                </div>

                {reward ? (
                  <>
                    <p className="benefit-reward">
                      <FaCheckCircle /> {config?.loyaltyReward || "Premio disponible"}
                    </p>

                    <button
                      className="button primary full"
                      onClick={() => {
                        setSelectedService(service);
                        setRedeemModal(true);
                      }}
                    >
                      Usar ahora
                    </button>
                  </>
                ) : (
                  <p className="benefit-remaining">Te faltan {remaining} para tu premio</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BaseModal open={redeemModal} onClose={() => setRedeemModal(false)}>
        <div className="confirm-modal">
          <h3>Confirmar premio</h3>

          <p>
            Vas a usar tu beneficio en:
            <strong> {selectedService}</strong>
          </p>

          <div className="modal-actions">
            <button className="button secondary" onClick={() => setRedeemModal(false)}>
              Cancelar
            </button>

            <button
              className="button primary"
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
