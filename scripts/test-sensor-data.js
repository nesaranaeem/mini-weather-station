import fetch from "node-fetch";

const API_URL = "http://localhost:3000/api/sensor-data";
const API_KEY = xxx;

async function postSampleData() {
  const sampleData = {
    temperature: 25.5,
    humidity: 65.2,
    gasValue: 120,
    soundDetected: true,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(sampleData),
    });

    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

postSampleData();
