import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function StatsCharts({ stats }) {
  if (!stats) return null;

  const barData = {
    labels: ["Turnos", "Confirmados"],
    datasets: [
      {
        data: [stats.total, stats.confirmed],
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const doughnutData = {
    labels: ["Confirmados", "Pendientes"],
    datasets: [
      {
        data: [
          stats.confirmed,
          stats.total - stats.confirmed,
        ],
        cutout: "70%",
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#888" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#888" },
        grid: { color: "#222" },
      },
    },
    responsive: true,
      maintainAspectRatio: false, // 🔥 CLAVE
      plugins: {
        legend: { display: false },
      },
  };

  return (
    <div className="stats-wrapper">

      {/* KPIs */}
      <div className="stats-cards">
        <div className="stat-card">
          <span>Total</span>
          <h2>{stats.total}</h2>
        </div>

        <div className="stat-card">
          <span>Confirmados</span>
          <h2>{stats.confirmed}</h2>
        </div>

        <div className="stat-card">
          <span>Ingresos</span>
          <h2>${stats.income}</h2>
        </div>
      </div>

      
    </div>
  );
}

export default StatsCharts;