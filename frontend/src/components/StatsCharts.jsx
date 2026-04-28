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
        label: "Estadísticas",
        data: [stats.total, stats.confirmed],
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
      },
    ],
  };

  return (
    <div className="charts">
      <div className="chart-box">
        <Bar data={barData} />
      </div>

      <div className="chart-box">
        <Doughnut data={doughnutData} />
      </div>
    </div>
  );
}

export default StatsCharts;