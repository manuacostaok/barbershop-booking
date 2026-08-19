import { useEffect, useRef } from "react";

// Fondo de "red neuronal" — puntos que se mueven despacio y se
// conectan con una línea cuando están cerca, tipo particles.js.
// El color lo toma en vivo de --color-primary, así que sigue a
// la paleta elegida en Admin > Apariencia sin necesitar props.
export default function NeuralBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width, height, dpr;
    let points = [];
    let animationId;

    const DENSITY = 9000; // menor = más puntos
    const MAX_DIST = 130; // distancia máxima para dibujar una conexión
    const SPEED = 0.15;

    const getColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#21e6b0";

    const hexToRgb = (hex) => {
      const m = hex.replace("#", "");
      const bigint = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(90, Math.floor((width * height) / DENSITY));

      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      }));
    }

    function tick() {
      const [r, g, b] = hexToRgb(getColor());
      ctx.clearRect(0, 0, width, height);

      // mover puntos y rebotar en los bordes
      points.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      // conexiones entre puntos cercanos
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // los puntos en sí
      points.forEach((p) => {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="app-neural-bg" />;
}
