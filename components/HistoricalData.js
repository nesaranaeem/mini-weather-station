import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2";
import { formatInTimeZone } from "date-fns-tz";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Important: Register all the pieces needed for bar charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HistoricalData({
  data,
  dateRange,
  onDateChange,
  selectedDate,
  showDatePicker = true,
}) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Get user's chosen timezone from localStorage or default to UTC
  const timezone = typeof window !== "undefined"
    ? localStorage.getItem("timezone") || "UTC"
    : "UTC";

  // Construct an hourly timestamp from date + hour for each data point
  const chartLabels = data.map((d) => {
    const dateObj = new Date(d.date);
    dateObj.setHours(d.hour, 0, 0, 0);
    return formatInTimeZone(dateObj, timezone, "HH:mm");
  });

  // Define the chart data
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        type: "bar",
        label: t("dashboard.temperature"),
        data: data.map((d) => d.averageTemperature),
        backgroundColor: "rgba(54, 162, 235, 0.8)", // blue
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        type: "bar",
        label: t("dashboard.humidity"),
        data: data.map((d) => d.averageHumidity),
        backgroundColor: "rgba(75, 192, 192, 0.8)", // teal
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        type: "bar",
        label: t("dashboard.gasValue"),
        data: data.map((d) => d.averageGasValue),
        backgroundColor: "rgba(255, 99, 132, 0.8)", // pinkish red
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart config options
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
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
          {i18n.language === "en" ? "Hourly Averages" : "ঘণ্টার গড়"}
        </span>

        {showDatePicker && (
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
        )}
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      ) : data.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t("dashboard.noData")}
        </div>
      )}
    </div>
  );
}
