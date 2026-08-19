import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InstallPrompt from "../components/InstallPrompt";
import Aurora from "../components/Aurora";
import api from "../api";

// Colores del Aurora por PALETA — el color intermedio (fondo) y
// la opacidad dependen del MODO. Pedido explícito: el Aurora
// tiene que ser consistente con la combinación paleta+modo
// elegida en Admin > Config > Apariencia, en toda la app.
const PALETTE_HUES = {
  esmeralda: { from: "#21e6b0", to: "#ffb020" },
  rosa: { from: "#e85d8a", to: "#f4a4c0" },
  azul: { from: "#5b8def", to: "#22d3ee" },
  neutro: { from: "#0d9488", to: "#f59e0b" },
};

const MODE_SETTINGS = {
  oscuro: { mid: "#0a0a11", opacity: 0.4 },
  claro: { mid: "#f7f7f9", opacity: 0.2 },
};

function getAurora(palette, mode) {
  const hues = PALETTE_HUES[palette] || PALETTE_HUES.esmeralda;
  const modeCfg = MODE_SETTINGS[mode] || MODE_SETTINGS.oscuro;

  return {
    colors: [hues.from, modeCfg.mid, hues.to],
    opacity: modeCfg.opacity,
  };
}

function Layout({ children }) {
  const [palette, setPalette] = useState("esmeralda");
  const [mode, setMode] = useState("oscuro");

  // La apariencia la define el admin del negocio (Configuración >
  // Apariencia). Se aplica acá, a nivel global, para que se vea
  // igual en la página pública y dentro de todos los paneles.
  useEffect(() => {
    api.get("/local")
      .then((res) => {
        const p = res.data?.themePalette || "esmeralda";
        const m = res.data?.themeMode || "oscuro";

        setPalette(p);
        setMode(m);

        document.documentElement.setAttribute("data-palette", p);
        document.documentElement.setAttribute("data-mode", m);
      })
      .catch(() => {});
  }, []);

  const aurora = getAurora(palette, mode);

  return (
    <div className="app">
      <div className="app-aurora-bg" style={{ opacity: aurora.opacity }}>
        <Aurora colorStops={aurora.colors} amplitude={1.0} blend={0.6} speed={0.5} />
      </div>

      <Navbar />

      <main className="main-content">
        {children}
      </main>

      <InstallPrompt />
    </div>
  );
}

export default Layout;
