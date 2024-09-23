import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { parseVTT } from "./utils/parse-subtitle";

const Popup = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fontSize, setFontSize] = useState("16");
  const [subtitleColor, setSubtitleColor] = useState("#000000");
  const [enableSubtitles, setEnableSubtitles] = useState(false);
  const [isSubtitleLoaded, setIsSubtitleLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(
      ["fontSize", "fontColor", "enableSubtitles", "subtitleFile"],
      (result) => {
        if (result.fontSize) {
          setFontSize(result.fontSize);
        }
        if (result.fontColor) {
          setSubtitleColor(result.fontColor);
        }
        if (result.enableSubtitles) {
          setEnableSubtitles(result.enableSubtitles);
        }
        if (result.subtitleFile) {
          setIsSubtitleLoaded(true);
        }
      }
    );
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      const file1 = event.target.files[0];

      if (file1) {
        const reader = new FileReader();

        reader.onload = function (e) {
          const subtitleContent = e.target?.result;

          if (!subtitleContent) {
            return;
          }

          chrome.storage.local.set(
            { subtitleFile: parseVTT(subtitleContent.toString()) },
            function () {
              console.log("Value is set to " + subtitleContent);
            }
          );
        };

        reader.readAsText(file1);
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

  const handleSubtitleColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSubtitleColor(event.target.value);
    chrome.storage.local.set({
      fontColor: event.target.value,
    });
  };

  const handleEnableSubtitlesChange = () => {
    setEnableSubtitles(!enableSubtitles);
    console.log({ popup: !enableSubtitles });
    chrome.storage.local.set({
      enableSubtitles: !enableSubtitles,
    });
  };

  return (
    <div className="w-[350px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-6">
      <div className="pb-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <img src="mascot.png" alt="logo" className="h-8 w-8" />
            Subtaitoru
          </span>
          <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Beta
          </span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Subtitle File
          </label>
          <div className="relative">
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById("file-upload")?.click()}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Choose File
            </button>
          </div>
          {file && (
            <p className="text-sm text-gray-600">File uploaded: {file.name}</p>
          )}
          {isSubtitleLoaded && (
            <p className="text-sm text-gray-600">Subtitle loaded</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="font-size"
            className="block text-sm font-medium text-gray-700"
          >
            Font Size
          </label>
          <select
            id="font-size"
            value={fontSize}
            onChange={handleFontSizeChange}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[12, 16, 20, 24, 36, 48].map((size) => (
              <option key={size} value={size.toString()}>
                {size}px
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="subtitle-color"
            className="block text-sm font-medium text-gray-700"
          >
            Subtitle Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="subtitle-color"
              type="color"
              value={subtitleColor}
              onChange={handleSubtitleColorChange}
              className="w-12 h-8 p-1 bg-white border border-gray-300 rounded"
            />
            <input
              type="text"
              value={subtitleColor}
              onChange={(e) => setSubtitleColor(e.target.value)}
              className="flex-grow bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="enable-subtitles"
            className="text-sm font-medium text-gray-700"
          >
            Enable Subtitles
          </label>
          <button
            role="switch"
            aria-checked={enableSubtitles}
            onClick={handleEnableSubtitlesChange}
            className={`${
              enableSubtitles ? "bg-blue-600" : "bg-gray-200"
            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span className="sr-only">Enable subtitles</span>
            <span
              aria-hidden="true"
              className={`${
                enableSubtitles ? "translate-x-5" : "translate-x-0"
              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
            />
          </button>
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mt-6">
        <a href="#" className="hover:text-blue-600 transition-colors">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-blue-600 transition-colors">
          How to Use
        </a>
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
