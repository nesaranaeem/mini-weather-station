import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatInTimeZone } from "date-fns-tz/formatInTimeZone";
import { FaThermometerHalf, FaTint, FaWind } from "react-icons/fa";
import RadialMeter from "./RadialMeter";
import HistoricalData from "./HistoricalData";

export default function WeatherDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching sensor data...");
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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    console.log("Data fetch interval set");

    return () => {
      console.log("Cleaning up interval");
      clearInterval(interval);
    };
  }, []);

  if (loading) return <div className="text-center p-8">Loading...</div>;
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
  const realFeel = calculateRealFeel(
    latestData.temperature,
    latestData.humidity
  );
  const gasType = identifyGas(latestData.gasValue);

  return (
    <div className="container mx-auto p-4 dark:bg-gray-950">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.title")}
        </h1>
        <div className="mt-2 text-gray-600 dark:text-gray-400 flex items-center justify-center">
          {data.realtime?.length > 0 && formatInTimeZone(
            new Date(data.realtime[data.realtime.length - 1].timestamp),
            localStorage.getItem('timezone') || 'UTC',
            "'Viewing data for' HH:mm, dd MMM yyyy"
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-black">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-black">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {t("dashboard.gasValue")}
          </h2>
          <div className="text-3xl font-bold dark:text-white">{gasType}</div>
          <div className="text-gray-600 dark:text-gray-300">
            Value: {latestData.gasValue}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-black">
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

      <HistoricalData data={data.hourlyAverages} />
    </div>
  );
}

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
