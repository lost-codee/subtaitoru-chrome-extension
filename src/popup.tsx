import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

// Utils
import { parseVTT } from "./utils/parse-vtt";
import { cn } from "./utils/cn";

// Constants
import { DEFAULT_FONT_SIZE } from "./constants";

// Style
import "./index.css";

const Popup = () => {
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [color, setColor] = useState("#383838");
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setFileName(event.target.files[0].name);
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
          const subtitleContent = e.target?.result;

          if (!subtitleContent) {
            return;
          }

          chrome.storage.local.set(
            {
              subtitle: {
                fileName: file.name,
                content: parseVTT(subtitleContent.toString()),
              },
            },
            function () {
              console.log("Content uploaded: ", subtitleContent);
            }
          );
        };

        reader.readAsText(file);
      }
    }
  };

  const handleFontSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFontSize(event.target.value);
    chrome.storage.local.set({
      fontSize: event.target.value,
    });
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
    chrome.storage.local.set({
      fontColor: event.target.value,
    });
  };

  const handleShowSubtitlesChange = (showSubtitles: boolean) => {
    setShowSubtitles(showSubtitles);
    chrome.storage.local.set({
      showSubtitles,
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
    chrome.storage.local.get(
      ["fontSize", "fontColor", "showSubtitles", "subtitle"],
      (result) => {
        if (result.fontSize) {
          setFontSize(result.fontSize);
        }
        if (result.fontColor) {
          setColor(result.fontColor);
        }
        if (result.showSubtitles) {
          setShowSubtitles(result.showSubtitles);
        }
        if (result.subtitle) {
          setFileName(result.subtitle.fileName);
        }
      }
    );
  }, []);

  return (
    <div className="w-80 bg-purple-50 p-4 font-sans text-gray-800 max-h-[400px] overflow-auto">
      <header className="flex items-center mb-6">
        <div
          className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2"
          aria-hidden="true"
        >
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <h1 className="text-xl font-bold">Subtaitoru</h1>
      </header>

      <main>
        {/* <div className="mb-6">
          <label htmlFor="file-upload" className="flex space-x-2 mb-2 ">
            <span>Upload file</span>
            {fileName ? <strong>{fileName}</strong> : ""}
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".vtt,.srt"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload subtitle file"
          />
          <button
            onClick={handleUploadClick}
            className={cn(
              "w-full focus:ring-2 focus:ring-offset-2  text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out",
              fileName
                ? "bg-[#1F2937] hover:bg-[#2d3a4d]"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            )}
          >
            {fileName ? "Choose a file" : "Upload a new file"}
          </button>
        </div> */}
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
                  value={color}
                  onChange={handleColorChange}
                  className="w-12 h-8 p-1 bg-white border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={color}
                  onChange={handleColorChange}
                  className="flex-grow bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between space-y-4 ">
              <label
                className="text-sm font-medium mb-1"
                id="show-subtitles-label"
              >
                Enable subtitles
              </label>
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
            </div>
          </div>
        </section>
      </main>

      <footer className="flex justify-between text-sm text-gray-600">
        <a
          href="https://subtaitoru-web.vercel.app/"
          target="_blank"
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
        >
          How to use?
        </a>
        <a
          target="_blank"
          href="https://subtaitoru-web.vercel.app/privacy-policy"
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
