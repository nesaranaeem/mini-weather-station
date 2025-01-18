import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import timezones from '../utils/timezones';

export default function LanguageTimeZoneModal({ isOpen, onClose, onSave }) {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Dhaka'); // GMT+6

  const handleSave = () => {
    // Trigger a custom event for timezone/language change
    const event = new Event('preferencesChanged');
    window.dispatchEvent(event);

    localStorage.setItem('preferredLanguage', selectedLanguage);
    localStorage.setItem('timezone', selectedTimezone);
    onSave(selectedLanguage, selectedTimezone);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
          {t('preferences.selectPreferences')}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
            {t('preferences.language')}
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white text-black dark:bg-gray-700 dark:text-white"
          >
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-black dark:text-white">
            {t('preferences.timezone')}
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white text-black dark:bg-gray-700 dark:text-white"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {t('preferences.save')}
        </button>
      </div>
    </div>
  );
}
