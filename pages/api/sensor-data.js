import dbConnect from "../../utils/mongodb";
import SensorData from "../../models/SensorData";
import HourlySensorData from "../../models/HourlySensorData";
import { verifyApiKey } from "../../utils/auth";

// Global variable to store real-time data with timestamp
let realTimeData = [];
const MAX_REALTIME_ENTRIES = 100;
let lastData = null;

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Always verify API key
    const apiKey = req.headers["x-api-key"];
    if (!verifyApiKey(apiKey)) {
      console.warn("Unauthorized access attempt");
      return res.status(401).json({
        message: "Unauthorized - Valid API key required",
        code: "INVALID_API_KEY",
      });
    }

    try {
      await dbConnect();

      const { date, hour } = req.query;

      if (date && hour) {
        // Get specific hourly data
        const startOfDay = new Date(date);
        const hourlyData = await HourlySensorData.findOne({
          date: startOfDay,
          hour: parseInt(hour),
        });

        return res.status(200).json({
          hourlyData,
          realtime: realTimeData,
        });
      }

      // Get latest hourly averages
      // Get available dates range
      const dateRange = await HourlySensorData.aggregate([
        {
          $group: {
            _id: null,
            minDate: { $min: "$date" },
            maxDate: { $max: "$date" },
          },
        },
      ]);

      const queryDate = req.query.date ? new Date(req.query.date) : new Date();
      queryDate.setHours(0, 0, 0, 0);

      console.log("Fetching hourly averages for date:", queryDate);

      const hourlyAverages = await HourlySensorData.find({
        date: queryDate,
      }).sort({ hour: 1 });

      console.log("Found hourly averages:", hourlyAverages);
      console.log("Current realtime data:", realTimeData);

      // If no realtime data exists, get the latest sensor reading
      if (!realTimeData.length) {
        const latestReading = await SensorData.findOne().sort({
          createdAt: -1,
        });
        if (latestReading) {
          realTimeData = [
            { ...latestReading.toObject(), timestamp: latestReading.createdAt },
          ];
          console.log(
            "Added latest sensor reading to realtime data:",
            latestReading
          );
        }
      }

      // Initialize empty arrays if no data exists
      const response = {
        hourlyAverages: hourlyAverages || [],
        realtime: realTimeData || [],
        dateRange: dateRange.length
          ? {
              minDate: dateRange[0].minDate.toISOString().split("T")[0],
              maxDate: dateRange[0].maxDate.toISOString().split("T")[0],
            }
          : null,
      };

      console.log("Sending response:", response);
      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching sensor data" });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Verify API key
    const apiKey = req.headers["x-api-key"];
    if (!verifyApiKey(apiKey)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const { temperature, humidity, gasValue, soundDetected } = req.body;

    // Create new sensor data entry
    const sensorData = new SensorData({
      temperature,
      humidity,
      gasValue,
      soundDetected,
    });

    // Save to database
    const savedData = await sensorData.save();

    // Only update real-time data if values have changed
    const hasChanged =
      !lastData ||
      lastData.temperature !== temperature ||
      lastData.humidity !== humidity ||
      lastData.gasValue !== gasValue ||
      lastData.soundDetected !== soundDetected;

    if (hasChanged) {
      realTimeData.push({
        ...savedData.toObject(),
        timestamp: new Date(),
      });
      if (realTimeData.length > MAX_REALTIME_ENTRIES) {
        realTimeData.shift();
      }
      lastData = { temperature, humidity, gasValue, soundDetected };
    }

    // Check if we need to create/update hourly data
    const now = new Date();
    const currentHour = now.getHours();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    // Find or create hourly record
    let hourlyData = await HourlySensorData.findOne({
      date: startOfDay,
      hour: currentHour,
    });

    if (!hourlyData) {
      // Create new hourly record
      hourlyData = new HourlySensorData({
        date: startOfDay,
        hour: currentHour,
        averageTemperature: temperature,
        averageHumidity: humidity,
        averageGasValue: gasValue,
        soundEvents: soundDetected ? 1 : 0,
      });
    } else {
      // Get all readings for current hour
      const hourlyReadings = await SensorData.find({
        createdAt: {
          $gte: new Date(now.setHours(currentHour, 0, 0, 0)),
          $lt: new Date(now.setHours(currentHour + 1, 0, 0, 0)),
        },
      });

      // Calculate averages
      const totals = hourlyReadings.reduce(
        (acc, reading) => ({
          temperature: acc.temperature + reading.temperature,
          humidity: acc.humidity + reading.humidity,
          gasValue: acc.gasValue + reading.gasValue,
          soundEvents: acc.soundEvents + (reading.soundDetected ? 1 : 0),
        }),
        { temperature: 0, humidity: 0, gasValue: 0, soundEvents: 0 }
      );

      const count = hourlyReadings.length;
      hourlyData.averageTemperature = totals.temperature / count;
      hourlyData.averageHumidity = totals.humidity / count;
      hourlyData.averageGasValue = totals.gasValue / count;
      hourlyData.soundEvents = totals.soundEvents;
    }

    await hourlyData.save();

    res.status(200).json({
      success: true,
      data: savedData,
      realtime: realTimeData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving sensor data" });
  }
}
