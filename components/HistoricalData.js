import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useTranslation } from "react-i18next";
import { Line } from "react-chartjs-2";
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
  const [dateRange, setDateRange] = useState({ min: null, max: null });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDateRange = async () => {
      try {
        const response = await fetch("/api/sensor-data", {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        const result = await response.json();
        if (result.dateRange) {
          setDateRange({
            min: result.dateRange.minDate,
            max: result.dateRange.maxDate,
          });
          setSelectedDate(result.dateRange.maxDate);
        }
      } catch (error) {
        console.error("Error fetching date range:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDateRange();
  }, []);

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
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
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      ) : dateRange.min && dateRange.max ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t("dashboard.selectDate")}
          </label>
          <div className="relative">
            <DatePicker
              selected={new Date(selectedDate)}
              onChange={(date) => setSelectedDate(date.toISOString().split('T')[0])}
              minDate={new Date(dateRange.min)}
              maxDate={new Date(dateRange.max)}
              dateFormat="yyyy-MM-dd"
              className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              calendarClassName="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded-lg"
              showPopperArrow={false}
            />
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t("dashboard.availableRange")}: {dateRange.min} - {dateRange.max}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          {t("dashboard.noDateRange")}
        </div>
      )}

      {data.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t("dashboard.noData")}
        </div>
      )}
    </div>
  );
}
