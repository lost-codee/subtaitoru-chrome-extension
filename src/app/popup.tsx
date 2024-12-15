import React from "react";
import { createRoot } from "react-dom/client";
import { SettingsProvider, useSettings } from "../context/settings-context";

// Utils
import { cn } from "../utils/cn";
import { initializeErrorHandling } from "../utils/error-handler";

// Styles
import "../styles/global.css";
import { BeakerIcon } from '@heroicons/react/24/outline';

// Constants
import { BUG_REPORT_FORM_URL } from "../lib/constants";


const Popup = () => {
  const { settings, updateSettings } = useSettings();

  // Default values if settings are not yet loaded
  const isHoverEnabled = settings?.hoverTranslation?.enabled ?? true;
  const isAmazonEnabled = settings?.amazonScript?.enabled ?? true;

  const handleQuizClick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      // Inject the content script into the active tab if not already injected
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id as number },
        files: ["quiz.js"],
      });
    });
  };

  const handleManageLearnings = () => {
    chrome.tabs.create({ url: "profile.html" });
  };

  const toggleHoverTranslation = () => {
    updateSettings({
      hoverTranslation: {
        ...settings?.hoverTranslation,
        enabled: !isHoverEnabled,
      },
    });
  };

  const toggleAmazonScript = async () => {
    updateSettings({
      amazonScript: {
        ...settings?.amazonScript,
        enabled: !isAmazonEnabled,
      },
    });
  };

  return (
    <div className="w-80 bg-purple-50 p-4 font-sans text-gray-800 max-h-[400px] overflow-auto">
      <header className="flex items-center mb-6 justify-between">
        <a
          className="flex items-center"
          href="https://subtaitoru.site"
          target="_blank"
        >
          <div
            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2"
            aria-hidden="true"
          >
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-bold">Subtaitoru</h1>
        </a>
      </header>
      <main>
        <section aria-labelledby="quiz-title" className="mb-6">
          <h2
            id="quiz-title"
            className="text-2xl font-bold leading-tight text-gray-900"
          >
            Take a Quiz
          </h2>

          <div className="mt-3 text-sm text-gray-600">
            <p>Improve your Japanese learning by taking a short quiz.</p>
          </div>

          <div className="mt-5 flex flex-col space-y-4">
            <button
              onClick={handleQuizClick}
              className="w-full focus:ring-2 focus:ring-offset-2  text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Take Quiz
            </button>
            <button
              onClick={handleManageLearnings}
              className={cn(
                "w-full focus:ring-2 focus:ring-offset-2  text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out",
                "bg-[#1F2937] hover:bg-[#2d3a4d]"
              )}
            >
              Manage words
            </button>
          </div>
        </section>
        {/* Hover Translation Settings */}
        <section aria-labelledby="hover-translation-title" className="mb-6">
          <h2
            id="hover-translation-title"
            className="text-lg font-semibold mb-4 text-gray-900"
          >
            Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Tranlsation on hover</label>
              <button
                onClick={toggleHoverTranslation}
                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors",
                  isHoverEnabled ? "bg-indigo-600" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "absolute w-4 h-4 bg-white rounded-full transition-transform top-1",
                    isHoverEnabled ? "left-6" : "left-1"
                  )}
                />
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">AmazonPrime subtitles</label>
                  <BeakerIcon className="h-4 w-4 text-amber-500" title="Experimental feature" />
                </div>
                <button
                  onClick={toggleAmazonScript}
                  className={cn(
                    "w-11 h-6 rounded-full relative transition-colors",
                    isAmazonEnabled ? "bg-indigo-600" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute w-4 h-4 bg-white rounded-full transition-transform top-1",
                      isAmazonEnabled ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </div>
              <p className="text-xs text-amber-600">This feature is experimental and may not work as expected</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex justify-between text-sm text-gray-600">
        <a
          href="https://subtaitoru.site/"
          target="_blank"
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
        >
          How to use?
        </a>
        <a
          target="_blank"
          href="https://subtaitoru.site/privacy-policy"
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
        >
          Privacy Policy
        </a>
      </footer>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => window.open(BUG_REPORT_FORM_URL, '_blank')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Report a Bug
        </button>
      </div>
    </div>
  );
};

// Initialize global error handling
initializeErrorHandling();

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <SettingsProvider>
      <Popup />
    </SettingsProvider>
  </React.StrictMode>
);
