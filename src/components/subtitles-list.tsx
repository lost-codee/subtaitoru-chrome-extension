import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { YoutubeCaptionsTokenize } from "../types";
import { findCurrentCaption } from "../utils/find-current-caption";
import { useSettings } from "../context/settings-context";

interface SubtitlesListProps {
  captions: YoutubeCaptionsTokenize[];
  videoElement: HTMLVideoElement;
}

export const SubtitlesList = ({
  captions,
  videoElement,
}: SubtitlesListProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const height = videoElement.clientHeight;
  const { settings } = useSettings();

  const handleTimeClick = (time: number) => {
    if (videoElement) {
      videoElement.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!videoElement) return;

    let animationFrameId: any;

    const updateSubtitles = () => {
      const currentTime = videoElement.currentTime;
      const currentCaption = findCurrentCaption(captions, currentTime);

      if (!currentCaption) {
        return;
      }

      // get index from currentCaption
      const index = captions.findIndex((caption) => caption.text === currentCaption.text);
      setCurrentIndex(index);

      // Continue checking in the next frame
      animationFrameId = requestAnimationFrame(updateSubtitles);
    };

    // Start the update loop
    animationFrameId = requestAnimationFrame(updateSubtitles);

    return () => {
      // Clean up the animation frame
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [captions, videoElement]);

  if (!settings.showSubtitlesList) {
    return null;
  }

  return (
    <div
      className="bg-[#0f0f0f] text-white rounded-lg shadow-lg flex flex-col relative"
      style={{
        height: height ? `${height}px` : "auto",
        maxHeight: "100vh",
      }}
    >
      <div className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-[#333] p-[12px]">
        <div className="text-[#f1f1f1] text-[14px] font-medium">
          Video Subtitles
        </div>
      </div>
      <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        {captions.map((caption, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={cn(
                "flex items-start group transition-colors duration-150 hover:bg-[#272727] cursor-pointer px-[16px] py-[12px]",
                "border-l-2 border-transparent",
                isActive ? "bg-[#272727] border-l-2 border-[#ff9b3c]" : ""
              )}
              onClick={() => handleTimeClick(caption.start)}
            >
              <div className="text-[#ff9b3c] text-[12px] font-medium min-w-[48px] bg-[#1a1a1a] rounded px-[8px] py-[4px] group-hover:bg-[#333] transition-colors duration-150">
                {formatTime(caption.start)}
              </div>
              <div className="text-[#f1f1f1] text-[14px] leading-relaxed ml-3 flex-1">
                {caption.text.join("")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};