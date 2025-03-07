import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import { formatInTimeZone } from "date-fns-tz";
import {
  FaThermometerHalf,
  FaTint,
  FaWind,
  FaSun,
  FaMoon,
  FaClock,
  FaCircle,
  FaMicrochip,
  FaMapMarkerAlt,
} from "react-icons/fa";
import anime from "animejs";
import { getSunriseSunset } from "../utils/sunrise-sunset";
import RadialMeter from "./RadialMeter";
import HistoricalData from "./HistoricalData";

export default function WeatherDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [sunData, setSunData] = useState(null);

  const fetchDataForDate = async (date) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/sensor-data?date=${date.toISOString().split('T')[0]}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );
      const result = await response.json();
      setData((prevData) => ({
        ...prevData,
        hourlyAverages: result.hourlyAverages,
      }));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data for date:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Animate the live dot
    anime({
      targets: ".live-dot",
      opacity: [0.2, 1],
      easing: "easeInOutSine",
      duration: 1000,
      loop: true,
    });

    // Listen for preferences changes
    const handlePreferencesChange = () => {
      setLoading(true);
      // Refetch data after a short delay
      setTimeout(() => {
        fetchAllData();
      }, 500);
    };

    window.addEventListener("preferencesChanged", handlePreferencesChange);

    const fetchAllData = async () => {
      try {
        // Fetch sensor data
        const response = await fetch("/api/sensor-data", {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        const result = await response.json();
        console.log("Received data:", result);

        if (!result.realtime || !result.hourlyAverages) {
          console.error("Invalid data format received:", result);
          throw new Error("Invalid data format");
        }

        setData(result);
        setIsRealTime(result.realtime?.length > 0);

        // Fetch sunrise-sunset data
        const sunriseData = await getSunriseSunset();
        setSunData(sunriseData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 5000); // Update every 5 seconds
    console.log("Data fetch interval set");

    return () => {
      console.log("Cleaning up interval");
      clearInterval(interval);
      window.removeEventListener("preferencesChanged", handlePreferencesChange);
    };
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {t("dashboard.loading")}
        </p>
      </div>
    );

  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  if (!data || (!data.realtime?.length && !data.hourlyAverages?.length)) {
    return <div className="text-center p-8">{t("dashboard.noData")}</div>;
  }

  const latestData = data.realtime?.length
    ? data.realtime[data.realtime.length - 1]
    : {
        temperature: 0,
        humidity: 0,
        gasValue: 0,
        soundDetected: false,
      };
  const realFeel = calculateRealFeel(latestData.temperature, latestData.humidity);
  const gasType = identifyGas(latestData.gasValue);

  return (
    <div className="container mx-auto p-4 bg-gray-100 dark:bg-gray-950">
      <div className="text-center mb-4 md:mb-8 relative overflow-hidden p-4 md:p-8 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700">
        <div className="absolute inset-0 bg-black opacity-10 dark:opacity-30"></div>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4 relative z-10 animate-title">
          {t("dashboard.title")}
        </h1>
        <p className="text-xs md:text-sm text-white/80 dark:text-white/80 mb-2 md:mb-4 relative z-10">
          Developed and coded by Nesar Ahmed Naeem
        </p>
        <div className="mt-1 md:mt-2 text-white/90 dark:text-white/90 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center mb-2 animate-fadeIn space-y-2 md:space-y-0">
            {data.realtime?.length > 0 && (
              <div className="flex items-center justify-center">
                <FaCircle
                  className="text-green-500 mr-2 live-dot"
                  style={{ fontSize: "8px" }}
                />
                <span className="text-xs md:text-sm">
                  {formatInTimeZone(
                    new Date(data.realtime[data.realtime.length - 1].timestamp),
                    localStorage.getItem("timezone") || "UTC",
                    "'Viewing data for' HH:mm, dd MMM yyyy"
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 text-xs md:text-sm">
            <div className="flex items-center whitespace-nowrap">
              <FaMapMarkerAlt className="mr-1 text-xs md:text-sm" />
              <span>{t("dashboard.sensorLocation")}</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <FaMicrochip className="mr-1 text-xs md:text-sm" />
              <span>{t("dashboard.cpuType")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-black dark:text-white">
        <RadialMeter
          value={latestData.temperature}
          max={50}
          title={t("dashboard.temperature")}
          unit="°C"
          icon={
            <FaThermometerHalf className="text-2xl text-black dark:text-white" />
          }
        />
        <RadialMeter
          value={latestData.humidity}
          max={100}
          title={t("dashboard.humidity")}
          unit="%"
          icon={<FaTint className="text-2xl text-black dark:text-white" />}
        />
        <RadialMeter
          value={realFeel}
          max={50}
          title={t("dashboard.realFeel")}
          unit="°C"
          icon={<FaWind className="text-2xl text-black dark:text-white" />}
        />
      </div>

      {/* Historical Data Chart */}
      <div className="mb-8">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <HistoricalData
            data={data.hourlyAverages}
            showDatePicker={false}
            selectedDate={new Date()}
          />
        )}
      </div>

      {/* Sunrise & Sunset Section */}
      {loading || !sunData ? (
        <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {t("sunriseSunset.loading")}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-black dark:text-white flex items-center justify-between">
            <span className="flex items-center">
              <FaSun className="mr-2 text-yellow-500" /> {t("sunriseSunset.title")}
            </span>
            <span className="text-sm font-normal ml-2 text-gray-600 dark:text-gray-400">
              ({t("sunriseSunset.timezone")}: {sunData.timezone})
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sunrise */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                <FaSun className="text-yellow-500 text-xl" />
              </div>
              <div>
                <div className="text-sm text-black dark:text-white">
                  {t("sunriseSunset.sunrise")}
                </div>
                <div className="text-lg font-semibold text-black dark:text-white">
                  {formatInTimeZone(
                    new Date(sunData.sunrise),
                    sunData.timezone,
                    "HH:mm"
                  )}
                </div>
              </div>
            </div>

            {/* Sunset */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                <FaMoon className="text-indigo-500 text-xl" />
              </div>
              <div>
                <div className="text-sm text-black dark:text-white">
                  {t("sunriseSunset.sunset")}
                </div>
                <div className="text-lg font-semibold text-black dark:text-white">
                  {formatInTimeZone(
                    new Date(sunData.sunset),
                    sunData.timezone,
                    "HH:mm"
                  )}
                </div>
              </div>
            </div>

            {/* Day Length */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaClock className="text-blue-500 text-xl" />
              </div>
              <div>
                <div className="text-sm text-black dark:text-white">
                  {t("sunriseSunset.dayLength")}
                </div>
                <div className="text-lg font-semibold text-black dark:text-white">
                  {(sunData.day_length / 3600).toFixed(1)}{" "}
                  {t("sunriseSunset.hours")}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            {t("sunriseSunset.dataSource")}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-black dark:text-white">
        <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
            {t("dashboard.gasValue")}
          </h2>
          <div className="text-3xl font-bold dark:text-white">{gasType}</div>
          <div className="text-gray-600 dark:text-gray-300">
            Value: {latestData.gasValue}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
            {t("dashboard.soundStatus")}
          </h2>
          <div
            className={`text-3xl font-bold ${
              latestData.soundDetected
                ? "text-green-500 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {latestData.soundDetected
              ? t("dashboard.active")
              : t("dashboard.inactive")}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <HistoricalData
          data={data.hourlyAverages}
          dateRange={data.dateRange}
          onDateChange={fetchDataForDate}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}

/** Utility Functions */
function calculateRealFeel(temperature, humidity) {
  // Heat index calculation using Steadman's formula
  const T = temperature;
  const RH = humidity;

  // Simple formula for lower temperatures
  if (T < 27) {
    return T.toFixed(1);
  }

  // Full formula for higher temperatures
  const realFeel =
    -8.784695 +
    1.61139411 * T +
    2.338549 * RH -
    0.14611605 * T * RH -
    0.012308094 * T * T -
    0.016424828 * RH * RH +
    0.002211732 * T * T * RH +
    0.00072546 * T * RH * RH -
    0.000003582 * T * T * RH * RH;

  return realFeel.toFixed(1);
}

function identifyGas(value) {
  if (value <= 100) return "Fresh Air";
  if (value <= 300) return "LPG";
  if (value <= 500) return "Methane";
  if (value <= 700) return "Smoke";
  return "High Gas";
            }
