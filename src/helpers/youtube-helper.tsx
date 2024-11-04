import React, { useState, useEffect, useRef } from "react";

// Components
import { SubtitlesPopup } from "../components/subtitles-popup";

// Utils
import { tokenizeJapaneseText } from "../utils/tokenize-japanese-text";

export const YoutubeHelper: React.FC<{
  videoElement: HTMLVideoElement;
}> = React.memo(({ videoElement }) => {
  const [subtitles, setSubtitles] = useState<string[] | null>(null);

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
        if (captionElements.length === 0) {
          setSubtitles(null);
          return;
        }
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
    const containerElement = document.querySelector(
      ".ytp-caption-window-container"
    ) as HTMLDivElement;
    if (containerElement) {
      containerElement.style.visibility = "hidden";
    }

    // Tokenize the caption text
    const tokens = tokenizeJapaneseText(text);
    setSubtitles(tokens);
  };

  return <SubtitlesPopup subtitles={subtitles} videoElement={videoElement} />;
});
