import "@/styles/globals.css";
import i18n from "../utils/i18n";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LanguageTimeZoneModal from "../components/LanguageTimeZoneModal";
import "react-datepicker/dist/react-datepicker.css";

export default function App({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasPreferences = localStorage.getItem('preferredLanguage') && localStorage.getItem('timezone');
      if (!hasPreferences) {
        setShowPreferences(true);
      }
      setInitialized(true);
    }
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
    setDarkMode(!darkMode);
  };

  const handlePreferencesSave = (language, timezone) => {
    i18n.changeLanguage(language);
    localStorage.setItem('preferredLanguage', language);
    localStorage.setItem('timezone', timezone);
    setShowPreferences(false);
  };

  const openPreferences = () => {
    setShowPreferences(true);
  };

  if (!initialized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col">
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        onOpenPreferences={() => setShowPreferences(true)}
      />
      <main className="flex-grow container mx-auto px-4 py-8 dark:bg-gray-950">
        <Component {...pageProps} />
      </main>
      <Footer />
      <LanguageTimeZoneModal 
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handlePreferencesSave}
      />
    </div>
  );
}
