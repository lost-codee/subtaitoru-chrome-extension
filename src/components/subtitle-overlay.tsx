import React, { useEffect, useRef, useState } from "react";
import { WordPopover } from "./word-popover";

export interface Subtitle {
  id: string;
  words: string[];
}

export interface SubtitleOverlayProps {
  subtitle: Subtitle | null | undefined;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitle,
}) => {
  const [position, setPosition] = useState({ left: "50%", top: "50%" });
  const [isDragging, setIsDragging] = useState(false); // New state to track dragging
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState({
    fontSize: "16px",
    fontColor: "#fff",
  });
  const [showPopover, setShowPopover] = useState(false);
  const [wordInfo, setWordInfo] = useState<{
    word: string;
    reading: string;
    meaning: string;
    partOfSpeech?: string;
    examples?: { japanese: string; english: string }[];
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPosition();
    loadSettings();
  }, []);

  const loadPosition = () => {
    chrome.storage.local.get("subtitlePosition", (result) => {
      if (result.subtitlePosition) {
        setPosition(result.subtitlePosition);
      }
    });
  };

  const loadSettings = () => {
    chrome.storage.local.get(["fontSize", "fontColor"], (result) => {
      setSettings({
        fontSize: result.fontSize ? `${result.fontSize}px` : "16px",
        fontColor: result.fontColor || "#fff",
      });
    });
  };

  // Handle mouse down event to start dragging
  const handleMouseDown = (event: React.MouseEvent) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top,
      });
      setIsDragging(true);
    }
  };

  // Handle mouse move event to update the position
  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      setPosition({
        left: `${event.clientX - dragOffset.x}px`,
        top: `${event.clientY - dragOffset.y}px`,
      });
    }
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      chrome.storage.local.set({ subtitlePosition: position });
    }
  };

  // Add event listeners for mouse move and mouse up when dragging starts
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const fetchWordTranslation = async (word: string) => {
    try {
      // search for video in the dom and stop it
      const video = document.querySelector("video");
      if (video) {
        setTimeout(() => {
          video.pause();
        }, 500);
      }

      const response = await fetch(
        `https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-2b644326-e110-425e-8caf-162881ff4c84/sample/hello?keyword=${word}`
      );
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        const wordInfo = data.data[0];
        setWordInfo({
          word,
          reading: wordInfo.japanese[0].reading,
          meaning: wordInfo.senses[0].english_definitions.join(", "),
          partOfSpeech: wordInfo.senses[0].parts_of_speech.join(", "),
          // examples: wordInfo.japanese[0].examples,
        });
        setShowPopover(true);
      }
    } catch (error) {
      console.error("Error fetching translation:", error);
    }
  };

  return (
    <>
      <div
        className={`subtitle-overlay ${subtitle ? "" : "hidden"}`}
        ref={containerRef}
        style={{
          left: position.left,
          top: position.top,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="subtitle-content">
          <p className="subtitle-text">
            {subtitle?.words.map((word, index) => (
              <span
                key={index}
                className="subtitle-word"
                style={{
                  fontSize: settings.fontSize,
                  color: settings.fontColor,
                }}
                onClick={() => {
                  fetchWordTranslation(word);
                }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>
      {showPopover && wordInfo && (
        <WordPopover word={wordInfo} onClose={() => setShowPopover(false)} />
      )}
    </>
  );
};
