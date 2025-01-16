import WeatherDashboard from "../components/WeatherDashboard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Head from "next/head";
export default function Home() {
  const { i18n } = useTranslation();

  return (
    <>
      <Head>
        <title>Weather</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          <WeatherDashboard />
        </div>
      </div>
    </>
  );
}
