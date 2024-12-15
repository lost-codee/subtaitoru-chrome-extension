import React, { useEffect, useRef, useState } from "react";
import { Subtitles } from "./subtitles";
import { LoadingIndicator } from "./ui/loading";
import { TranslationPopup } from "./translation-popup";
import { useSubtitles } from "../hooks/use-subtitles";
import { useSettings } from "../context/settings-context";
import { VideoControls } from "./video-controls";
import { CaptionsTokenized } from "../types";

interface SubtitlesWrapperProps {
  subtitles: CaptionsTokenized[];
  videoElement: HTMLVideoElement;
}

/**
 * A component that renders an interactive subtitle overlay on top of a video element.
 */
export const SubtitlesWrapper: React.FC<SubtitlesWrapperProps> = ({
  subtitles,
  videoElement,
}) => {
  const isMounted = useRef(true);
  const subtitleWrapperRef = useRef<HTMLDivElement>(null);
  const [subtitleOffset, setSubtitleOffset] = useState<number>(0);
  const [position, setPosition] = useState({ bottom: 64 });
  const {settings} = useSettings();
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
 
 
  const wrapperStyle = {
    bottom: `${position.bottom}px`,
    left: "50%",
    transform: "translateX(-50%)",
  } as const;
  
  return (
    <>
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
         
            />
        )}
        {popupState.isFetching && <LoadingIndicator message="Loading Translation" />}
       { settings.showSubtitles &&
        <Subtitles
        subtitles={subtitles}
        subtitleOffset={subtitleOffset}
        videoElement={videoElement}
        onWordClick={fetchWordDetails}
        />
       } 
      </div>
      <VideoControls onOffsetChange={setSubtitleOffset} currentOffset={subtitleOffset}/>
    </>
  );
};
