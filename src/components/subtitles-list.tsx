import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { YoutubeCaptionsTokenize } from "../types";
import { findCurrentCaption } from "../utils/find-current-caption";

interface SubtitlesListProps {
    captions: YoutubeCaptionsTokenize[];
    videoElement: HTMLVideoElement;
}
  
 export const SubtitlesList = ({
    captions,
    videoElement,
  }: SubtitlesListProps) => {
    const [currentCaption, setCurrentCaption] = useState<string>("");
    const height  = videoElement.clientHeight;
  
  
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
            
          setCurrentCaption(currentCaption ? currentCaption.text.join("") : "");
  
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
  
  
    return (
      <div 
        className="bg-[#0f0f0f] text-white rounded-lg shadow-lg flex flex-col"
        style={{
          height: height ? `${height}px` : 'auto',
          maxHeight: '100vh',
        }}
      >
        <div className="overflow-y-auto flex-grow">
          {captions.map((caption, index) => (
            <div
              key={index}
              className={cn("flex hover:bg-[#272727] cursor-pointer px-[12px] py-[8px]", currentCaption === caption.text.join("") ? "bg-[#272727]" : "")}
              onClick={() => handleTimeClick(caption.start)}
            >
              <div className="text-[#ff9b3c] text-[12px] font-medium w-[40px] pt-0.5">
                {formatTime(caption.start)}
              </div>
              <div className="text-[#f1f1f1] text-[14px] ml-[8px] flex-1">
                {caption.text.join("")}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  