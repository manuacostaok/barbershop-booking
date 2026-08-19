import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaDownload, FaTimes, FaShareSquare, FaPlusSquare } from "react-icons/fa";

const DISMISSED_KEY = "installPromptDismissed";

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState(null); // "android" | "ios"
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (isInStandaloneMode()) return; // ya está instalada

    // Android/Chrome: el navegador dispara este evento cuando la
    // app es instalable — lo interceptamos para mostrar nuestro
    // propio banner en vez del mini-banner nativo del navegador.
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setMode("android");
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // iOS/Safari nunca dispara beforeinstallprompt — no hay forma
    // programática de instalar, así que mostramos instrucciones.
    if (isIos()) {
      const timer = setTimeout(() => {
        setMode("ios");
        setVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="install-prompt"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <button className="install-prompt-close" onClick={dismiss} aria-label="Cerrar">
            <FaTimes />
          </button>

          <div className="install-prompt-icon">
            <img src="/icon-192.png" alt="TurnosIA" />
          </div>

          <div className="install-prompt-body">
            <strong>Instalá TurnosIA</strong>

            {mode === "android" ? (
              <p>Agregala a tu pantalla de inicio para reservar más rápido.</p>
            ) : (
              <p>
                Tocá <FaShareSquare className="inline-icon" /> compartir y luego{" "}
                <FaPlusSquare className="inline-icon" /> "Agregar a pantalla de inicio".
              </p>
            )}
          </div>

          {mode === "android" && (
            <button className="button primary install-prompt-btn" onClick={handleInstall}>
              <FaDownload /> Instalar
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
