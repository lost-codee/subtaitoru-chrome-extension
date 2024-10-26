import React, { useState, useEffect, useRef } from "react";

// components
import { Subtitle } from "../components/subtitles-box";
import { SubtitlesPopup } from "../components/subtitles-popup";

// utils
import { tokenizeJapaneseText } from "../utils/parse-subtitle";

export const YoutubeHelper: React.FC<{
  videoElement: HTMLVideoElement;
}> = React.memo(({ videoElement }) => {
  const [subtitles, setSubtitles] = useState<Subtitle | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(handleCaptionChanges);

    // Initialize the caption observer
    init(observer);

    return () => {
      // Clean up the observer and tooltip on unmount
      observer.disconnect();
    };
  }, []);

  const init = (observer: MutationObserver) => {
    waitForElement(".ytp-caption-window-container").then(() => {
      const container = document.querySelector(".ytp-caption-window-container");
      if (container) {
        observer.observe(container, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    });
  };

  const waitForElement = (selector: string): Promise<void> => {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve();
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  };

  const handleCaptionChanges = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const captionElements = document.querySelectorAll(
          ".ytp-caption-segment"
        );
        captionElements.forEach(processCaptionElement);
      }
    });
  };

  const processCaptionElement = (element: Element) => {
    if (element.hasAttribute("data-processed")) return;

    const text = element.textContent || "";

    if (text.length === 0) {
      setSubtitles(null);
      return;
    }

    // Hide the original captions
    const captionElement = element as HTMLDivElement;
    captionElement.style.visibility = "hidden";

    // Tokenize the caption text
    const tokens = tokenizeJapaneseText(text);
    setSubtitles({
      id: "1",
      words: tokens,
    });
  };

  return <SubtitlesPopup subtitle={subtitles} videoElement={videoElement} />;
});
