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

// Register all necessary Chart.js components
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
    // Simulate brief loading so chart doesn't flash
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Decide on timezone (fallback to "UTC")
  const timezone = typeof window !== "undefined"
    ? localStorage.getItem("timezone") || "UTC"
    : "UTC";

  // Build an array of labels based on date + hour
  const chartLabels = data.map((d) => {
    const dateObj = new Date(d.date);
    dateObj.setHours(d.hour, 0, 0, 0);
    return formatInTimeZone(dateObj, timezone, "HH:mm");
  });

  // Prepare the data for bar chart
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        type: "bar",
        label: t("dashboard.temperature"),
        data: data.map((d) => d.averageTemperature),
        backgroundColor: "rgba(54, 162, 235, 0.8)", // Blue
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        barThickness: 30,       // Force each bar's thickness (px)
        maxBarThickness: 40,    // Max size a bar can grow to
      },
      {
        type: "bar",
        label: t("dashboard.humidity"),
        data: data.map((d) => d.averageHumidity),
        backgroundColor: "rgba(75, 192, 192, 0.8)", // Teal
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        barThickness: 30,
        maxBarThickness: 40,
      },
      {
        type: "bar",
        label: t("dashboard.gasValue"),
        data: data.map((d) => d.averageGasValue),
        backgroundColor: "rgba(255, 99, 132, 0.8)", // Pinkish red
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        barThickness: 30,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Let the container control height
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: t("dashboard.averages"),
      },
    },
    scales: {
      y: {
        beginAtZero: true, // So bars start at 0
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
        <div style={{ height: "300px" }}>
          {/* Give the bar chart a fixed height so bars are always visible */}
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t("dashboard.noData")}
        </div>
      )}
    </div>
  );
}
