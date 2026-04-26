import { motion } from "framer-motion";

function ConfirmModal({ open, onClose, onConfirm, text }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <p>{text}</p>

        <div className="modal-actions">
          <button className="btn cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn confirm" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ConfirmModal;