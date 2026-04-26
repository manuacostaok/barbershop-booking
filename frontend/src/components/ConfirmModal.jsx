import { motion, AnimatePresence } from "framer-motion";

function ConfirmModal({ open, onClose, onConfirm, text }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
          >
            <p>{text}</p>

            <div className="modal-actions">
              <button onClick={onClose}>Cancelar</button>
              <button className="danger" onClick={onConfirm}>
                Confirmar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;