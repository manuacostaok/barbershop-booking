import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import Login from "../pages/Login";

function LoginModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
            <motion.div
              className="modal login-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
            {/* ❌ CERRAR */}
            <div className="modal-close" onClick={onClose}>
              <FaTimes />
            </div>

            {/* 🔥 ENVOLVEMOS LOGIN (CLAVE) */}
            <div className="login-modal-content">
              <Login />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginModal;