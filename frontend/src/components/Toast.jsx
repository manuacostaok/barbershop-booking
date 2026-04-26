import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose(); // 🔥 se cierra solo
      }, 2500); // 2.5 segundos

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;