import WeatherDashboard from "../components/WeatherDashboard";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add loading state when language or timezone changes
    const handleStorageChange = () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initial load
    setTimeout(() => setIsLoading(false), 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const pageTitle = i18n.language === 'bn' ? 'আবহাওয়া স্টেশন' : 'Weather Station';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-screen">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <WeatherDashboard />
          )}
        </div>
      </div>
    </>
  );
}
