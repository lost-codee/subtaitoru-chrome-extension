import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

// Components
import { Subtitles } from "./utils/parse-subtitle";
import { Subtitle, SubtitleOverlay } from "./components/subtitle-overlay";

const video = document.querySelector("video");

function timeToSeconds(time: string) {
  const [hours, minutes, seconds] = time.split(":").map(parseFloat);
  return hours * 3600 + minutes * 60 + seconds;
}

const SubtitlesContainer: React.FC = () => {
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [subtitles, setSubtitles] = useState<Subtitles[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>();

  useEffect(() => {
    loadEnableSubtitles();
    loadSubtitles();
  }, []);

  useEffect(() => {
    if (!subtitles || !video) return;

    video.ontimeupdate = () => {
      const currentTime = video.currentTime;
      const currentSubtitle1 = subtitles.find(
        (sub) =>
          timeToSeconds(sub.startTime) <= currentTime &&
          timeToSeconds(sub.endTime) >= currentTime
      );

      if (currentSubtitle1) {
        setCurrentSubtitle({
          id: currentSubtitle1.startTime,
          words: currentSubtitle1.text,
        });
      } else {
        setCurrentSubtitle(null);
      }
    };

    return () => {
      video.ontimeupdate = null;
    };
  }, [subtitles]);

  const loadEnableSubtitles = () => {
    chrome.storage.local.get("enableSubtitles", (result) => {
      if (result.enableSubtitles) {
        setSubtitlesEnabled(result.enableSubtitles);
      }
    });
  };

  const loadSubtitles = () => {
    chrome.storage.local.get("subtitleFile", (result) => {
      if (result.subtitleFile) {
        setSubtitles(result.subtitleFile);
      }
    });
  };

  if (!subtitlesEnabled || !video) {
    return null;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <SubtitleOverlay subtitle={currentSubtitle} />
    </div>
  );
};

// Add the React app to the DOM within a Shadow DOM
if (video) {
  // Create a container for the subtitles inside the video element
  const subtitlesContainer = document.createElement("div");
  subtitlesContainer.id = "subtitles-react-root";

  // Style the container to match the size of the video element and overlay it
  subtitlesContainer.style.position = "absolute";
  subtitlesContainer.style.top = "0";
  subtitlesContainer.style.left = "0";
  subtitlesContainer.style.width = "100%";
  subtitlesContainer.style.height = "100%";
  subtitlesContainer.style.zIndex = "9999"; // Ensure it stays above the video

  // Attach a Shadow DOM to the container
  const shadowRoot = subtitlesContainer.attachShadow({ mode: "open" });

  const sheet = new CSSStyleSheet();

  const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .subtitle-overlay {
  position: fixed;
  padding: 16px;
  width: 100%;
  max-width: 768px;
  z-index: 9999;
  cursor: move;
}

.subtitle-content {
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.subtitle-text {
  font-size: 24px;
  text-align: center;
}

.subtitle-word {
  display: inline-block;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.subtitle-word:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Hides the overlay when no subtitle is present */
.hidden {
  display: none;
}


.popover-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.popover-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 0 16px;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eaeaea;
}

.popover-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #666;
}

.popover-body {
  padding: 16px;
  padding-top: 0;
}

.tab-buttons {
  display: flex;
  margin-bottom: 16px;
}

.tab-button {
  padding: 8px 16px;
  font-weight: 500;
  color: #666;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s;
}

.tab-button.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.info-content {
  color: #333;
  font-size: 16px;
}

.info-content,
.examples-content {
  margin-top: 8px;
}

.info-label {
  font-color: #3b3a3a;
  font-size: 14px;
  font-weight: bold;
}

.example-item {
  margin-bottom: 8px;
}

.example-japanese {
  color: #333;
}

.example-english {
  color: #666;
  font-style: italic;
}`;

  sheet.replaceSync(styles);

  // Add the style to the Shadow DOM
  shadowRoot.adoptedStyleSheets = [sheet];

  // Render the React app into the Shadow DOM
  ReactDOM.render(
    <React.StrictMode>
      <SubtitlesContainer />
    </React.StrictMode>,
    shadowRoot
  );

  // Attach it to the video element
  video.parentElement?.appendChild(subtitlesContainer);
}
