import React, { useCallback, useContext, useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { useSettings } from "../context/settings-context";
import { findCurrentCaption } from "../utils/find-current-caption";
import { CaptionsTokenized } from "../types";
import { VideoControls } from "./video-controls";


export interface SubtitlesProps {
  subtitles:CaptionsTokenized[];
  subtitleOffset: number;
  videoElement: HTMLVideoElement;
  onWordClick: (word: string) => void;
}

interface WordProps {
  word: string;
  onWordClick: (word: string) => void;
}

const Word: React.FC<WordProps> = React.memo(({ word, onWordClick }) => (
  <span
    className="inline-block cursor-pointer px-[4px] rounded transition-colors hover:bg-zinc-800"
    onClick={(event: React.MouseEvent) => {
      event.stopPropagation();
      onWordClick(word);
    }}
  >
    {word}
  </span>
));

Word.displayName = "Word";

export const Subtitles = React.memo(function Subtitles({
  subtitles,
  subtitleOffset,
  videoElement,
  onWordClick,
}: SubtitlesProps) {
  const [subtitle, setSubtitle] = useState<string[] | null>(null);
  const { settings } = useSettings();

  const handleMouseEnter = useCallback(() => {
    if (videoElement) {
      videoElement.pause();
    }
  }, [videoElement]);


  useEffect(() => {
    if (!videoElement) return;

    let animationFrameId: any;

    const updateSubtitles = () => {
      const currentTime = videoElement.currentTime + (subtitleOffset || 0);
      const currentCaption = findCurrentCaption(subtitles, currentTime);

      setSubtitle(currentCaption ? currentCaption.text : null);

      // Continue checking in the next frame
      animationFrameId = requestAnimationFrame(updateSubtitles);
    };

    // Start the update loop
    animationFrameId = requestAnimationFrame(updateSubtitles);

    return () => {
      // Clean up the animation frame
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [subtitles, videoElement, subtitleOffset]);

  if(!subtitle) {
    return null;
  }

  return (
      <div
        onMouseEnter={handleMouseEnter}
        className={cn(
          "bg-zinc-900/95 p-[12px] rounded-lg shadow-md flex flex-col cursor-move",
          subtitles ? "" : "hidden"
        )}
        style={{
          fontSize:settings.fontSize,
          color:settings.fontColor,
        }}
      >
        <div className="text-center leading-normal">
          {subtitle?.map((word, index) => (
            <Word key={index} word={word} onWordClick={onWordClick} />
          ))}
        </div>
      </div>
  );
});
