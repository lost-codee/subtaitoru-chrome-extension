import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

// Components
import { SubtitlesWrapper } from "../../components/subtitles-wrapper";
import { Loading } from "../../components/ui/loading";
import { createShadowContainer } from "../../utils/create-shadow-container";
import { BaseContentScriptProvider } from "./base-content-script";

// Utils
import { tokenizeJapaneseText } from "../../utils/tokenize-japanese-text";

// Constants
import { SUBTAITORU_ROOT_ID } from "../../lib/constants";

interface YoutubeCaptions {
  start: number;
  end: number;
  text: string;
}

interface YoutubeCaptionsToknize {
  start: number;
  end: number;
  text: string[];
}

const YoutubeSubtitles: React.FC<{
  videoElement: HTMLVideoElement;
}> = React.memo(({ videoElement }) => {
  const [captions, setCaptions] = useState<YoutubeCaptionsToknize[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subtitles, setSubtitles] = useState<string[] | null>(null);

  // Helper to fetch YouTube metadata and captions
  const fetchCaptions = async (videoId: string) => {
    setIsLoading(true);
    try {
      // Fetch YouTube video metadata
      const metadataResponse = await fetch(
        `https://www.youtube.com/watch?v=${videoId}`
      );
      const metadataHtml = await metadataResponse.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(metadataHtml, "text/html");
      const scripts = Array.from(doc.querySelectorAll("script"));
      const captionsScript = scripts.find(
        (script) =>
          script.textContent &&
          script.textContent.includes("ytInitialPlayerResponse = ")
      );

      if (!captionsScript || !captionsScript.textContent) {
        throw new Error("Unable to locate captions metadata.");
      }

      // Parse captions metadata
      const metadataMatch = captionsScript.textContent.match(
        /ytInitialPlayerResponse\s*=\s*(\{.*\});/
      );

      if (!metadataMatch) {
        throw new Error("Invalid captions metadata.");
      }

      const playerResponse = JSON.parse(metadataMatch[1]);

      if (!playerResponse || !playerResponse.captions) {
        throw new Error("Invalid captions metadata.");
      }

      const captionTracks =
        playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;

      if (!captionTracks || captionTracks.length === 0) {
        throw new Error("No captions available for this video.");
      }

      // Look for Japanese captions
      let trackUrl = captionTracks.find(
        (track: any) => track.languageCode === "ja"
      )?.baseUrl;

      if (!trackUrl) {
        // If no Japanese track, take the first available track
        const firstTrack = captionTracks[0];
        if (!firstTrack) {
          throw new Error("No captions available for this video.");
        }

        // Check if the track is translatable to Japanese
        if (firstTrack.isTranslatable) {
          const japaneseTranslation =
            playerResponse.captions?.playerCaptionsTracklistRenderer?.translationLanguages.find(
              (lang: any) => lang.languageCode === "ja"
            );

          if (japaneseTranslation) {
            trackUrl = `${firstTrack.baseUrl}&tlang=ja`; // Append translation language to URL
          }
        }
      }

      if (!trackUrl) {
        throw new Error(
          "No Japanese captions or translatable captions available for this video."
        );
      }

      // Fetch and parse captions data
      const captionsResponse = await fetch(trackUrl);
      const captionsText = await captionsResponse.text();
      const captionsParser = new DOMParser();
      const captionsDoc = captionsParser.parseFromString(
        captionsText,
        "text/xml"
      );
      const captionElements = captionsDoc.getElementsByTagName("text");

      const parsedCaptions: YoutubeCaptions[] = Array.from(captionElements).map(
        (element) => ({
          start: parseFloat(element.getAttribute("start") || "0"),
          end:
            parseFloat(element.getAttribute("dur") || "0") +
            parseFloat(element.getAttribute("start") || "0"),
          text: element.textContent || "",
        })
      );

      // tokenize to japanese text
      const tokenizeCaptions: YoutubeCaptionsToknize[] = parsedCaptions.map(
        (caption) => {
          const tokenize = tokenizeJapaneseText(caption.text);
          return { ...caption, text: tokenize };
        }
      );

      setCaptions(tokenizeCaptions);
    } catch (error) {
      console.error("Error fetching captions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const videoId = new URLSearchParams(window.location.search).get("v");

    if (videoId) {
      fetchCaptions(videoId);
    }
  }, []);

  const findCurrentCaption = (
    captions: YoutubeCaptionsToknize[],
    currentTime: number
  ) => {
    let left = 0;
    let right = captions.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const caption = captions[mid];

      if (currentTime >= caption.start && currentTime <= caption.end) {
        return caption;
      } else if (currentTime < caption.start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return null; // No matching caption found
  };

  useEffect(() => {
    if (!videoElement) return;

    let animationFrameId: any;

    const updateSubtitles = () => {
      const currentTime = videoElement.currentTime;

      const currentCaption = findCurrentCaption(captions, currentTime);

      setSubtitles(currentCaption ? currentCaption.text : null);

      // Continue checking in the next frame
      animationFrameId = requestAnimationFrame(updateSubtitles);
    };

    // Start the update loop
    animationFrameId = requestAnimationFrame(updateSubtitles);

    return () => {
      // Clean up the animation frame
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [captions, videoElement]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center p-4 pointer-events-auto justify-end z-[999] absolute h-full w-full">
        <div className="bg-white text-black p-[8px] rounded-md text-center mb-[8px] animate-[fadeIn]">
          <div className="flex items-center justify-center text-[14px]">
            <span>Fetching Captions</span>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  return <SubtitlesWrapper subtitles={subtitles} videoElement={videoElement} />;
});

const init = () => {
  if (document.getElementById(SUBTAITORU_ROOT_ID)) {
    return;
  }

  const container = document.getElementById("ytp-caption-window-container");

  if (!container) {
    return;
  }

  const shadowRoot = createShadowContainer(SUBTAITORU_ROOT_ID);
  container.appendChild(shadowRoot.host);

  const videoElement = document.getElementsByClassName(
    "video-stream html5-main-video"
  );

  if (!videoElement || videoElement.length === 0) {
    return;
  }

  ReactDOM.render(
    <React.StrictMode>
      <BaseContentScriptProvider>
        <YoutubeSubtitles videoElement={videoElement[0] as HTMLVideoElement} />
      </BaseContentScriptProvider>
    </React.StrictMode>,
    shadowRoot
  );
};

init();
