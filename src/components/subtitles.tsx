import React, { useCallback, useContext } from "react";
import { cn } from "../utils/cn";
import { useSettings } from "../context/settings-context";


export interface SubtitlesProps {
  subtitles?: string[] | null;
  dualSubtitles?: string | null;
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
  dualSubtitles,
  videoElement,
  onWordClick,
}: SubtitlesProps) {
  const { settings } = useSettings();

  const handleMouseEnter = useCallback(() => {
    if (videoElement) {
      videoElement.pause();
    }
  }, [videoElement]);

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
        {subtitles?.map((word, index) => (
          <Word key={index} word={word} onWordClick={onWordClick} />
        ))}
      </div>
      {dualSubtitles && <span>{dualSubtitles}</span>}
    </div>
  );
});
