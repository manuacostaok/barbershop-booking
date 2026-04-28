import { motion, AnimatePresence } from "framer-motion";

function CreateBarberModal({
  open,
  onClose,
  onCreate,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay">
        <motion.div
          className="modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <h2>Crear nuevo barbero ✂️</h2>

          <input
            className="input"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="modal-actions">
            <button className="button" onClick={onCreate}>
              Crear
            </button>

            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CreateBarberModal;