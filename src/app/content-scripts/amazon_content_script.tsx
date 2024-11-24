import React, { useState, useEffect, useRef, memo } from "react";
import ReactDOM from "react-dom";

// Components
import { SubtitlesWrapper } from "../../components/subtitles-wrapper";
import { BaseContentScript } from "./base-content-script";

// Utils
import { tokenizeJapaneseText } from "../../utils/tokenize-japanese-text";
import { createShadowContainer } from "../../utils/create-shadow-container";

// Constants
import { SUBTAITORU_ROOT_ID } from "../../lib/constants";

const AmazonPrimeSubtitles = memo(
  ({ videoElement }: { videoElement: HTMLVideoElement }) => {
    const [subtitles, setSubtitles] = useState<string[] | null>(null);

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
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData"
        ) {
          const captionElements = document.querySelectorAll(
            ".atvwebplayersdk-captions-text"
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
      setSubtitles(tokens);
    };

    const init = (observer: MutationObserver) => {
      waitForElement(".atvwebplayersdk-captions-overlay").then(() => {
        const container = document.querySelector(
          ".atvwebplayersdk-captions-overlay"
        );
        if (container) {
          observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
      });
    };

    useEffect(() => {
      const captionObserver = new MutationObserver(handleCaptionChanges);

      // Initialize the caption observer
      init(captionObserver);

      return () => {
        // Clean up the observers on unmount

        captionObserver.disconnect();
      };
    }, []);

    return subtitles ? (
      <SubtitlesWrapper subtitles={subtitles} videoElement={videoElement!} />
    ) : null;
  }
);

const renderSubtitles = (videoElement: HTMLVideoElement) => {
  if (document.getElementById(SUBTAITORU_ROOT_ID)) {
    return;
  }

  const shadowRoot = createShadowContainer(SUBTAITORU_ROOT_ID);
  videoElement.parentElement?.appendChild(shadowRoot.host);

  ReactDOM.render(
    <React.StrictMode>
      <BaseContentScript>
        <AmazonPrimeSubtitles videoElement={videoElement} />
      </BaseContentScript>
    </React.StrictMode>,
    shadowRoot
  );
};

const init = () => {
  const container = document.getElementsByClassName("webPlayerSDKContainer")[0];
  if (container) {
    const videoElement = container.querySelectorAll("video");
    if (videoElement && videoElement.length > 0) {
      renderSubtitles(videoElement[0] as HTMLVideoElement);
    }
  }
};

init();
