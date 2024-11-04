import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";

function timeToSeconds(time: string) {
  const [hours, minutes, seconds] = time.split(":").map(parseFloat);
  return hours * 3600 + minutes * 60 + seconds;
}

// Components
import { SubtitlesPopup } from "../components/subtitles-popup";
import { ParsedSubtitles } from "../utils/parse-vtt";

export const ManuallyUploadHelper: React.FC = () => {
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [parsedSubtitles, setParsedSubtitles] = useState<ParsedSubtitles[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string[] | null>();

  const video = document.querySelector("video");

  useEffect(() => {
    chrome.storage.local.get(["showSubtitles", "subtitle"], (result) => {
      if (result.showSubtitles) {
        setShowSubtitles(result.showSubtitles);
      }
      if (result.subtitle) {
        setParsedSubtitles(result.subtitle.content);
      }
    });
  }, []);

  useEffect(() => {
    if (!parsedSubtitles || !video) return;

    video.ontimeupdate = () => {
      if (!video) return;
      const currentTime = video.currentTime;
      const currentParsedSubtitle = parsedSubtitles.find(
        (sub) =>
          timeToSeconds(sub.startTime) <= currentTime &&
          timeToSeconds(sub.endTime) >= currentTime
      );

      if (currentParsedSubtitle) {
        setCurrentSubtitle(currentParsedSubtitle.text);
      } else {
        setCurrentSubtitle(null);
      }
    };

    return () => {
      if (!video) return;
      video.ontimeupdate = null;
    };
  }, [parsedSubtitles]);

  if (!showSubtitles || !video || !currentSubtitle) {
    return null;
  }

  return <SubtitlesPopup subtitles={currentSubtitle} videoElement={video} />;
};
