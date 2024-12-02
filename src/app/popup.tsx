import React from "react";
import { createRoot } from "react-dom/client";

// Utils
import { cn } from "../utils/cn";

// Styles
import "../styles/global.css";

const Popup = () => {
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

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
