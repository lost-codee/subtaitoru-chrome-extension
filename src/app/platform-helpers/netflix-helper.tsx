import React, { useEffect, useState, useCallback } from "react";
import { SubtitlesBox } from "../../components/subtitles-box";

interface NetflixHelperProps {
  videoElement: HTMLVideoElement;
}

interface Subtitle {
  text: string;
  startTime: number;
  endTime: number;
  id: string;
}

export const NetflixHelper: React.FC<NetflixHelperProps> = ({
  videoElement,
}) => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);

  const extractJapaneseSubtitles = useCallback(() => {
    // Netflix stores subtitles in a hidden div with class .player-timedtext
    const subtitleContainer = document.querySelector(".player-timedtext");
    if (!subtitleContainer) return null;

    // Get the text content from the subtitle container
    const textElement = subtitleContainer.querySelector("span");
    if (!textElement) return null;

    const text = textElement.textContent;
    if (!text) return null;

    // Create subtitle object with current video time
    const currentTime = videoElement.currentTime;
    return {
      text,
      startTime: currentTime,
      endTime: currentTime + 3, // Netflix typically shows subs for ~3 seconds
      id: Date.now().toString(),
    };
  }, [videoElement]);

  const handleTimeUpdate = useCallback(() => {
    const subtitle = extractJapaneseSubtitles();
    if (!subtitle) return;

    // Check if this subtitle is different from the last one
    if (currentSubtitle?.text !== subtitle.text) {
      setCurrentSubtitle(subtitle);
      setSubtitles((prev) => {
        // Avoid duplicate subtitles
        if (prev.some((s) => s.text === subtitle.text)) return prev;
        return [...prev, subtitle];
      });
    }
  }, [currentSubtitle, extractJapaneseSubtitles]);

  useEffect(() => {
    // Check if Japanese subtitles are enabled
    const checkForJapaneseSubtitles = () => {
      const subtitleButton =
        document.querySelector('[aria-label*="字幕"]') ||
        document.querySelector('[aria-label*="Japanese"]');
      return !!subtitleButton;
    };

    if (!checkForJapaneseSubtitles()) {
      console.warn("Japanese subtitles are not enabled");
      return;
    }

    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoElement, handleTimeUpdate]);

  // Monitor subtitle changes using MutationObserver
  useEffect(() => {
    const subtitleContainer = document.querySelector(".player-timedtext");
    if (!subtitleContainer) return;

    const observer = new MutationObserver(() => {
      const subtitle = extractJapaneseSubtitles();
      if (subtitle) {
        setCurrentSubtitle(subtitle);
        setSubtitles((prev) => {
          if (prev.some((s) => s.text === subtitle.text)) return prev;
          return [...prev, subtitle];
        });
      }
    });

    observer.observe(subtitleContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [extractJapaneseSubtitles]);

  return (
    <SubtitlesBox
      videoElement={videoElement}
      subtitles={subtitles.map((e) => e.text)}
    />
  );
};
