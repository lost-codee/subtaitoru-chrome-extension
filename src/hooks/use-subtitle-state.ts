import { useState, useEffect, useRef } from "react";
import { DEFAULT_FONT_SIZE } from "../lib/constants";

interface UseSubtitleStateProps {
  initialPosition?: number;
}

export const useSubtitleState = () => {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [color, setColor] = useState("#fff");
  const [showSubtitles, setShowSubtitles] = useState(true);

  const isMounted = useRef(true);

  useEffect(() => {
    const loadSettings = () => {
      chrome.storage.local.get(
        ["fontSize", "fontColor", "showSubtitles"],
        (result) => {
          if (!isMounted.current) return;
          if (result.fontSize) setFontSize(result.fontSize);
          if (result.fontColor) setColor(result.fontColor);
          if (result.showSubtitles) setShowSubtitles(result.showSubtitles);
        }
      );
    };

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (!isMounted.current) return;
      if (changes.fontSize) setFontSize(changes.fontSize.newValue);
      if (changes.fontColor) setColor(changes.fontColor.newValue);
      if (changes.showSubtitles)
        setShowSubtitles(changes.showSubtitles.newValue);
    };

    loadSettings();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      isMounted.current = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return {
    fontSize,
    color,
    showSubtitles,
    isMounted,
  };
};
