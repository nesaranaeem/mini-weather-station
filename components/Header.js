import { FaSun, FaMoon } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function Header({ darkMode, toggleDarkMode }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 md:text-3xl">
            Weather
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label={
                darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {darkMode ? (
                <FaSun className="text-yellow-500 w-5 h-5" />
              ) : (
                <FaMoon className="text-gray-700 w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium text-sm transition-colors"
            >
              {language === "en" ? "বাংলা" : "English"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
