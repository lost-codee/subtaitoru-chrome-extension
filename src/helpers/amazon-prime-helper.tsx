import React, { useState, useEffect, useRef } from "react";

// components
import { Subtitle } from "../components/subtitles-box";
import { SubtitlesPopup } from "../components/subtitles-popup";

// utils
import { tokenizeJapaneseText } from "../utils/parse-subtitle";

export const AmazonPrimeHelper: React.FC<{
  videoElement: HTMLVideoElement;
}> = React.memo(({ videoElement }) => {
  const [subtitles, setSubtitles] = useState<Subtitle | null>(null);
  const previousCaptionText = useRef<string | null>(null);

  useEffect(() => {
    const handleCaptionsUpdate = () => {
      const captionElements = document.getElementsByClassName(
        "atvwebplayersdk-captions-text"
      );

      if (!captionElements || captionElements.length === 0) {
        setSubtitles(null);
        return;
      }

      // Hide the original captions
      const captionElement = captionElements[0] as HTMLDivElement;
      captionElement.style.visibility = "hidden";

      // Extract and trim the caption text
      const currentCaptionText = captionElement.textContent?.replace(/\s/g, "");

      // Prevent re-render if the caption text hasn't changed
      if (
        currentCaptionText &&
        currentCaptionText !== previousCaptionText.current
      ) {
        previousCaptionText.current = currentCaptionText;
        setSubtitles({
          id: "1",
          words: tokenizeJapaneseText(currentCaptionText),
        });
      }
    };

    const observer = new MutationObserver(handleCaptionsUpdate);

    // Observe changes in the DOM
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup observer on component unmount
    return () => {
      observer.disconnect();

      const captionElements = document.getElementsByClassName(
        "atvwebplayersdk-captions-text"
      );

      if (captionElements && captionElements.length > 0) {
        const captionElement = captionElements[0] as HTMLDivElement;
        captionElement.style.visibility = "visible";
      }
    };
  }, []);

  return <SubtitlesPopup subtitle={subtitles} videoElement={videoElement} />;
});
