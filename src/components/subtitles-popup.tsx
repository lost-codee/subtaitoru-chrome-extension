import React, { useState, useEffect, useRef } from "react";
import { Subtitle, SubtitlesBox } from "./subtitles-box";
import { DEFAULT_FONT_SIZE } from "../constants";

export const SubtitlesPopup: React.FC<{
  subtitle?: Subtitle | null;
  videoElement: HTMLVideoElement;
}> = ({ subtitle, videoElement }) => {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [color, setColor] = useState("#fff");
  const subtitleWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chrome.storage.local.get(["fontSize", "fontColor"], (result) => {
      if (result.fontSize) {
        setFontSize(result.fontSize);
      }
      if (result.fontColor) {
        setColor(result.fontColor);
      }
    });
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (subtitleWrapperRef.current) {
        const rect = subtitleWrapperRef.current.getBoundingClientRect();
        const initialY = event.clientY;
        const initialBottom = window.innerHeight - rect.bottom;

        const handleMouseMove = (event: MouseEvent) => {
          if (subtitleWrapperRef.current) {
            const newBottom = initialBottom - (event.clientY - initialY);
            subtitleWrapperRef.current.style.bottom = `${newBottom}px`;
          }
        };

        const handleMouseUp = () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      }
    };

    if (subtitleWrapperRef.current) {
      subtitleWrapperRef.current.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      if (subtitleWrapperRef.current) {
        subtitleWrapperRef.current.removeEventListener(
          "mousedown",
          handleMouseDown
        );
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center p-4 pointer-events-auto justify-end cursor-move z-[999] absolute bottom-12 left-1/2 transform -translate-x-1/2"
      style={{ fontSize, color }}
      ref={subtitleWrapperRef}
    >
      <SubtitlesBox subtitle={subtitle} videoElement={videoElement} />
    </div>
  );
};
