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

export default function HistoricalData({ data, dateRange, onDateChange, selectedDate }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
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
      <h2 className="text-xl font-semibold mb-6 text-center">
        <span className="block text-gray-900 dark:text-white mb-4">
          {i18n.language === 'en' ? 'Hourly Averages' : 'ঘণ্টার গড়'}
        </span>
        <div className="flex justify-center items-center">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => onDateChange(date)}
            minDate={dateRange ? new Date(dateRange.minDate) : null}
            maxDate={dateRange ? new Date(dateRange.maxDate) : null}
            dateFormat="dd MMM yyyy"
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200"
          />
        </div>
      </h2>
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
