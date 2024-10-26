import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";

function timeToSeconds(time: string) {
  const [hours, minutes, seconds] = time.split(":").map(parseFloat);
  return hours * 3600 + minutes * 60 + seconds;
}

// Components
import { ParsedSubtitles, tokenizeJapaneseText } from "../utils/parse-subtitle";
import { Subtitle } from "../components/subtitles-box";
import { SubtitlesPopup } from "../components/subtitles-popup";

const video = document.querySelector("video");

export const ManuallyUploadHelper: React.FC = () => {
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [parsedSubtitles, setParsedSubtitles] = useState<ParsedSubtitles[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>();

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
        setCurrentSubtitle({
          id: currentParsedSubtitle.startTime,
          words: currentParsedSubtitle.text,
        });
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

  return <SubtitlesPopup subtitle={currentSubtitle} videoElement={video} />;
};
