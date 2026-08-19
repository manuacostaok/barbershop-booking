import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InstallPrompt from "../components/InstallPrompt";
import Aurora from "../components/Aurora";
import api from "../api";

// Colores + intensidad del fondo animado, uno por tema — pedido
// explícito: el Aurora tiene que estar en TODA la app (paneles
// incluidos) y ser consistente con el tema elegido. En los temas
// claros bajamos mucho la opacidad y usamos colores más pastel,
// porque un glow pensado en aditivo para fondo oscuro se ve
// "lavado" si lo dejamos igual de fuerte sobre fondo claro.
const AURORA_BY_THEME = {
  esmeralda: { colors: ["#21e6b0", "#08080d", "#ffb020"], opacity: 0.4 },
  nocturno: { colors: ["#5b8def", "#0a0e17", "#22d3ee"], opacity: 0.4 },
  rosa: { colors: ["#e85d8a", "#fdf2f5", "#f4a4c0"], opacity: 0.22 },
  claro: { colors: ["#0d9488", "#f7f7f9", "#f59e0b"], opacity: 0.18 },
};

function Layout({ children }) {
  const [theme, setTheme] = useState("esmeralda");

  // El tema lo define el admin del negocio (Configuración >
  // Apariencia). Lo aplicamos acá, a nivel global, para que se
  // vea igual tanto en la página pública como dentro de los
  // paneles — no solo en Booking.jsx.
  useEffect(() => {
    api.get("/local")
      .then((res) => {
        const chosen = res.data?.theme || "esmeralda";
        setTheme(chosen);
        document.documentElement.setAttribute("data-theme", chosen);
      })
      .catch(() => {});
  }, []);

  const aurora = AURORA_BY_THEME[theme] || AURORA_BY_THEME.esmeralda;

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
