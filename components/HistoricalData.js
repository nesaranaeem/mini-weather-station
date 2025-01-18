import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2";
import { format, parseISO } from "date-fns/format";
import { formatInTimeZone } from "date-fns-tz/formatInTimeZone";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HistoricalData({ data }) {
  const { t } = useTranslation();
  const today = new Date();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const timezone = localStorage.getItem('timezone') || 'UTC';
  
  const chartData = {
    labels: data.map(d => formatInTimeZone(new Date(d.timestamp), timezone, 'HH:mm')),
    datasets: [
      {
        label: t("dashboard.temperature"),
        data: data.map((d) => d.averageTemperature),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
      {
        label: t("dashboard.humidity"),
        data: data.map((d) => d.averageHumidity),
        borderColor: "rgb(53, 162, 235)",
        tension: 0.1,
      },
      {
        label: t("dashboard.gasValue"),
        data: data.map((d) => d.averageGasValue),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: t("dashboard.averages"),
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      )}

      {data.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t("dashboard.noData")}
        </div>
      )}
    </div>
  );
}
