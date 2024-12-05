import React, { useEffect, useRef, useState } from "react";
import { Subtitles } from "./subtitles";
import { Loading } from "./ui/loading";
import { TranslationPopup } from "./translation-popup";
import { useSubtitles } from "../hooks/use-subtitles";
import { useSettings } from "../context/settings-context";

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

  const {settings} = useSettings();
  const isMounted = useRef(true);
  const subtitleWrapperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ bottom: number }>({
    bottom: 48,
  });
  const { popupState, fetchWordDetails, closePopup } = useSubtitles({
    videoElement,
    isMounted,
  });

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
  }, [subtitleWrapperRef]);

  if (!isMounted.current) {
    return null;
  }


  if(settings.showSubtitles === false) {
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
      className="flex flex-col items-center p-[16px] pointer-events-auto justify-end z-[999] absolute gap-4 w-full max-w-[800px]"
      style={wrapperStyle}
      onClick={()=> videoElement.play()}
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
