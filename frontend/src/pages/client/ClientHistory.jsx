import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaHistory, FaStar } from "react-icons/fa";
import api from "../../api";
import BaseModal from "../../components/BaseModal";

export default function ClientHistory() {
  const { appointments } = useOutletContext();

  const [reviewModal, setReviewModal] = useState(null); // appointment seleccionado
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState({}); // { [appointmentId]: true }
  const [toast, setToast] = useState("");

  const openReview = (appt) => {
    setReviewModal(appt);
    setRating(0);
    setComment("");
  };

  const submitReview = async () => {
    if (!rating) {
      setToast("Elegí una cantidad de estrellas");
      return;
    }

    try {
      const res = await api.post("/reviews", {
        barber: reviewModal.barber?._id,
        appointment: reviewModal._id,
        rating,
        comment,
      });

      setReviewed((prev) => ({ ...prev, [reviewModal._id]: true }));
      setToast(res.data.message);
      setReviewModal(null);
    } catch (err) {
      setToast(err.response?.data?.message || "Error enviando la reseña");
    }
  };

  return (
    <div className="page client-panel">
      <div className="page-header">
        <h1>Historial</h1>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <FaHistory className="empty-icon" />
          <p>Todavía no tenés turnos</p>
        </div>
      ) : (
        <div className="grid">
          {appointments.map((appt) => (
            <div key={appt._id} className="card">
              <h3>{appt.service}</h3>
              <p>{appt.barber?.name || "Sin profesional"}</p>
              <p>{appt.date} · {appt.time}</p>

              <span className={`status ${appt.status}`}>
                {appt.status}
              </span>

              {appt.status === "completed" && (
                reviewed[appt._id] ? (
                  <p className="review-sent-hint">¡Gracias por tu opinión!</p>
                ) : (
                  <button className="button secondary full" style={{ marginTop: 10 }} onClick={() => openReview(appt)}>
                    <FaStar /> Dejar reseña
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      <BaseModal open={!!reviewModal} onClose={() => setReviewModal(null)}>
        <h3>¿Cómo estuvo tu turno?</h3>
        <p className="review-modal-sub">{reviewModal?.service} — {reviewModal?.barber?.name}</p>

        <div className="star-picker">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`star-btn ${n <= rating ? "active" : ""}`}
              onClick={() => setRating(n)}
              aria-label={`${n} estrellas`}
            >
              <FaStar />
            </button>
          ))}
        </div>

        <textarea
          className="input"
          placeholder="Contanos tu experiencia (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />

        <div className="modal-actions">
          <button className="button secondary" onClick={() => setReviewModal(null)}>Cancelar</button>
          <button className="button primary" onClick={submitReview}>Enviar</button>
        </div>
      </BaseModal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
