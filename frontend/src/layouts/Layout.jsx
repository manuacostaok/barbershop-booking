import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InstallPrompt from "../components/InstallPrompt";
import Aurora from "../components/Aurora";
import NeuralBackground from "../components/NeuralBackground";
import api from "../api";

// Colores del Aurora, uno por PALETA — solo se usa en modo
// oscuro. En modo claro el Aurora se saca por completo (no solo
// se atenúa): un glow tipo WebGL con blending aditivo, pensado
// para fondo oscuro, no queda bien sobre fondo blanco por más
// que se le baje la opacidad — se ve "sucio". En modo claro la
// red neuronal de puntos ya aporta el movimiento de fondo.
const PALETTE_HUES = {
  esmeralda: { from: "#21e6b0", to: "#ffb020" },
  azul: { from: "#5b8def", to: "#22d3ee" },
  neutro: { from: "#0d9488", to: "#f59e0b" },
  rosa: { from: "#e85d8a", to: "#f4a4c0" },
  lavanda: { from: "#9b7ee8", to: "#e8b34a" },
  durazno: { from: "#ff8266", to: "#ffb949" },
};

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

  const isDark = mode === "oscuro";
  const hues = PALETTE_HUES[palette] || PALETTE_HUES.esmeralda;

  return (
    <div className="app">
      {isDark && (
        <div className="app-aurora-bg">
          <Aurora colorStops={[hues.from, "#0a0a11", hues.to]} amplitude={1.0} blend={0.6} speed={0.5} />
        </div>
      )}

      <NeuralBackground />

      <Navbar />

      <main className="main-content">
        {children}
      </main>

      <InstallPrompt />
    </div>
  );
}

export default Layout;
