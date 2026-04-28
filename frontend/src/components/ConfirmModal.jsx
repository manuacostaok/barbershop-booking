import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  text,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  hideButtons = false,
  children
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}

          // 🔥 CERRAR HACIENDO CLICK AFUERA
          onClick={onClose}
        >
          <motion.div
            className="modal"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}

            // 🔥 EVITA QUE EL CLICK INTERNO CIERRE EL MODAL
            onClick={(e) => e.stopPropagation()}
          >
            {/* ❌ BOTÓN CERRAR */}
            <div className="modal-close" onClick={onClose}>
              <FaTimes />
            </div>

            {/* CONTENIDO */}
            {children ? children : <p>{text}</p>}

            {/* BOTONES */}
            {!hideButtons && (
              <div className="modal-actions">
                <button onClick={onClose}>{cancelText}</button>

                <button className="danger" onClick={onConfirm}>
                  {confirmText}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;