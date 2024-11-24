import React, { useCallback, useContext } from "react";
import { cn } from "../utils/cn";
import { StorageContext } from "../providers/storage-provider";

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
    className="inline-block cursor-pointer px-[4px] rounded transition-colors duration-300 ease-in-out hover:bg-white hover:bg-opacity-20"
    onClick={(event) => {
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
  const storageContext = useContext(StorageContext);

  const handleMouseEnter = useCallback(() => {
    if (videoElement) {
      videoElement.pause();
    }
  }, [videoElement]);

  if (!subtitles?.length) {
    return null;
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className={cn(
        "bg-zinc-900/95 p-[12px] rounded-lg shadow-md leading-normal flex flex-col cursor-move",
        subtitles ? "" : "hidden"
      )}
      style={{
        fontSize: storageContext.settings.fontSize,
        color: storageContext.settings.fontColor,
      }}
    >
      <div>
        {subtitles.map((word, index) => (
          <Word key={index} word={word} onWordClick={onWordClick} />
        ))}
      </div>
      {dualSubtitles && <span>{dualSubtitles}</span>}
    </div>
  );
});
