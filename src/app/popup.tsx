import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

// Utils
import { cn } from "../utils/cn";

// Constants
import { DEFAULT_FONT_SIZE } from "../lib/constants";
import { Settings } from "../types";

// Styles
import "./styles/index.css";

const Popup = () => {
  const [settings, setSettings] = useState<Settings>({
    fontSize: DEFAULT_FONT_SIZE,
    fontColor: "#383838",
    showSubtitles: false,
  });

  const updateSettings = (
    key: keyof Settings,
    value: Settings[keyof Settings]
  ) => {
    setSettings((prevSettings) => {
      const settings = {
        ...prevSettings,
        [key]: value,
      };

      chrome.storage.local.set({
        settings,
      });

      return settings;
    });
  };

  const handleFontSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateSettings("fontSize", event.target.value);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings("fontColor", event.target.value);
  };

  const handleShowSubtitlesChange = (showSubtitles: boolean) => {
    updateSettings("showSubtitles", showSubtitles);
  };

  const handleQuizClick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      // Inject the content script into the active tab if not already injected
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id as number },
        files: ["js/quiz.js", "js/vendor.js"],
      });
    });
  };

  const handleManageLearnings = () => {
    chrome.tabs.create({ url: "profile.html" });
  };

  useEffect(() => {
    chrome.storage.local.get(["settings"], (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  const { showSubtitles, fontSize, fontColor } = settings;

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
        <button
          type="button"
          role="switch"
          aria-checked={showSubtitles}
          aria-labelledby="show-subtitles-label"
          onClick={() => handleShowSubtitlesChange(!showSubtitles)}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            showSubtitles ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span className="sr-only">
            {showSubtitles ? "Turn off subtitles" : "Turn on subtitles"}
          </span>
          <span
            className={`${
              showSubtitles ? "translate-x-6" : "translate-x-1"
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            aria-hidden="true"
          />
        </button>
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

        <section className="mb-6" aria-labelledby="settings-heading">
          <h2 id="settings-heading" className="text-lg font-semibold mb-2">
            Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="font-size"
                className="block text-sm font-medium mb-1"
              >
                Font-size
              </label>
              <select
                id="font-size"
                value={fontSize}
                onChange={handleFontSizeChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="16px">16px</option>
                <option value="24px">24px</option>
                <option value="32px">32px</option>
                <option value="40px">40px</option>
              </select>
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium mb-1">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="subtitle-color"
                  type="color"
                  value={fontColor}
                  onChange={handleColorChange}
                  className="w-12 h-8 p-1 bg-white border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={fontColor}
                  onChange={handleColorChange}
                  className="flex-grow bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
