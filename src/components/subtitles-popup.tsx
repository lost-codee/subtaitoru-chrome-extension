import React, { useState, useEffect, useRef } from "react";
import { SubtitlesBox } from "./subtitles-box";
import { DEFAULT_FONT_SIZE } from "../constants";

export const SubtitlesPopup: React.FC<{
  subtitles: string[] | null;
  videoElement: HTMLVideoElement;
}> = ({ subtitles, videoElement }) => {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [color, setColor] = useState("#fff");
  const [position, setPosition] = useState<{ bottom: number; left?: string }>({
    bottom: 48,
  });
  const subtitleWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chrome.storage.local.get(
      ["fontSize", "fontColor", "subtitlePosition"],
      (result) => {
        if (result.fontSize) {
          setFontSize(result.fontSize);
        }
        if (result.fontColor) {
          setColor(result.fontColor);
        }
        if (result.subtitlePosition) {
          setPosition(result.subtitlePosition);
        }
      }
    );
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ subtitlePosition: position });
  }, [position]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (subtitleWrapperRef.current) {
        const rect = subtitleWrapperRef.current.getBoundingClientRect();
        const initialY = event.clientY;
        const initialBottom = window.innerHeight - rect.bottom;

        const handleMouseMove = (event: MouseEvent) => {
          if (subtitleWrapperRef.current) {
            const newBottom = initialBottom - (event.clientY - initialY);
            setPosition({ bottom: newBottom });
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
      className="flex flex-col items-center p-4 pointer-events-auto justify-end cursor-move z-[999] absolute"
      style={{
        fontSize,
        color,
        bottom: position.bottom,
        left: "50%",
        transform: "translateX(-50%)",
      }}
      ref={subtitleWrapperRef}
    >
      <SubtitlesBox subtitles={subtitles} videoElement={videoElement} />
    </div>
  );
};
