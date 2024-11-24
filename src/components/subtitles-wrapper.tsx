import React, { useRef, useState } from "react";
import { Subtitles } from "./subtitles";
import { Loading } from "./ui/loading";
import { TranslationPopup } from "./translation-popup";
import { useSubtitleState } from "../hooks/use-subtitle-state";
import { useDragToMove } from "../hooks/use-drag-to-move";
import { useTranslationPopup } from "../hooks/use-translation-popup";

interface SubtitlesWrapperProps {
  subtitles: string[] | null;
  dualSubtitles?: string | null;
  videoElement: HTMLVideoElement;
}

const LoadingIndicator: React.FC = () => (
  <div className="bg-white text-black p-[8px] rounded-md text-center mb-[8px] animate-[fadeIn]">
    <div className="flex items-center justify-center text-[14px]">
      <span>Fetching translation</span>
      <Loading />
    </div>
  </div>
);

/**
 * A component that renders an interactive subtitle overlay on top of a video element.
 */
export const SubtitlesWrapper: React.FC<SubtitlesWrapperProps> = ({
  subtitles,
  dualSubtitles,
  videoElement,
}) => {
  const subtitleWrapperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ bottom: number }>({
    bottom: 48,
  });
  const { isMounted, showSubtitles } = useSubtitleState();
  const { popupState, fetchWordDetails, closePopup } = useTranslationPopup({
    videoElement,
    isMounted,
  });

  const updatePosition = (newPosition: { bottom: number }) => {
    if (!isMounted.current) return;
    setPosition(newPosition);
  };

  // Setup drag-to-move functionality
  useDragToMove({
    elementRef: subtitleWrapperRef,
    isMounted,
    onPositionChange: updatePosition,
  });

  if (!isMounted.current) {
    return null;
  }

  if (!showSubtitles) {
    return null;
  }

  const wrapperStyle = {
    bottom: position.bottom,
    left: "50%",
    transform: "translateX(-50%)",
  } as const;

  return (
    <div
      ref={subtitleWrapperRef}
      className="flex flex-col items-center p-4 pointer-events-auto justify-end z-[999] absolute gap-4"
      style={wrapperStyle}
    >
      {popupState.isVisible && popupState.wordDetails && (
        <TranslationPopup
          word={popupState.wordDetails}
          onClose={closePopup}
          isCached={popupState.isCached}
        />
      )}
      {popupState.isFetching && <LoadingIndicator />}
      <Subtitles
        subtitles={subtitles}
        dualSubtitles={dualSubtitles}
        videoElement={videoElement}
        onWordClick={fetchWordDetails}
      />
    </div>
  );
};
