import { useEffect, useState } from "react";
import api from "../../api";
import { FaStar, FaCommentDots } from "react-icons/fa";

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = () => {
    api.get("/reviews/feedback")
      .then((res) => setFeedback(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const markRead = async (id) => {
    await api.patch(`/reviews/${id}/read`);
    setFeedback((prev) => prev.map((f) => (f._id === id ? { ...f, read: true } : f)));
  };

  const unreadCount = feedback.filter((f) => !f.read).length;

  return (
    <div className="section">
      <div className="page-header">
        <h2>
          Feedback <span className="premium-tag" style={{ background: "var(--color-danger)" }}>Privado</span>
        </h2>
      </div>

      <p className="stats-hint">
        Reseñas de 1 a 3 estrellas — no se muestran en la página pública, solo las ves vos acá para poder mejorar.
        {unreadCount > 0 && ` Tenés ${unreadCount} sin leer.`}
      </p>

      {loading ? (
        <p>Cargando...</p>
      ) : feedback.length === 0 ? (
        <div className="empty-state">
          <FaCommentDots className="empty-icon" />
          <p>Todavía no hay feedback negativo. ¡Buena señal!</p>
        </div>
      ) : (
        <div>
          {feedback.map((f) => (
            <div key={f._id} className={`list-row feedback-row ${!f.read ? "unread" : ""}`}>
              <div className="list-row-main" style={{ flex: 1 }}>
                <div className="review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} className={i < f.rating ? "filled" : ""} />
                  ))}
                </div>

                {f.comment && <p className="feedback-comment">"{f.comment}"</p>}

                <span className="list-row-sub">
                  {f.clientName} {f.barber?.name && `· sobre ${f.barber.name}`} · {new Date(f.createdAt).toLocaleDateString("es-AR")}
                </span>
              </div>

              {!f.read && (
                <button className="button secondary" onClick={() => markRead(f._id)}>
                  Marcar leído
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
