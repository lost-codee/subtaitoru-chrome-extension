import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

// Components
import { SubtitlesWrapper } from "../../components/subtitles-wrapper";
import { Loading } from "../../components/ui/loading";
import { createShadowContainer } from "../../utils/create-shadow-container";
import { BaseContentScript } from "./base-content-script";

// Utils
import { tokenizeJapaneseText } from "../../utils/tokenize-japanese-text";

// Constants
import { SUBTAITORU_ROOT_ID } from "../../lib/constants";

interface YoutubeCaptions {
  start: number;
  end: number;
  text: string;
}

const YoutubeSubtitles: React.FC<{
  videoElement: HTMLVideoElement;
}> = React.memo(({ videoElement }) => {
  const [captions, setCaptions] = useState<YoutubeCaptions[]>([]);
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

      setCaptions(parsedCaptions);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching captions:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const videoId = new URLSearchParams(window.location.search).get("v");

    if (videoId) {
      fetchCaptions(videoId);
    }
  }, []);

  useEffect(() => {
    if (!videoElement) return;

    const ontimeupdate = () => {
      const currentTime = videoElement.currentTime;
      const currentCaption = captions.find(
        (caption) => currentTime >= caption.start && currentTime <= caption.end
      );

      if (currentCaption) {
        const tokens = tokenizeJapaneseText(currentCaption.text);
        setSubtitles(tokens);
      } else {
        setSubtitles(null);
      }
    };

    videoElement.ontimeupdate = ontimeupdate;

    return () => {
      if (!videoElement) return;
      videoElement.ontimeupdate = null;
    };
  }, [captions, videoElement]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center p-4 pointer-events-auto justify-end z-[999] absolute gap-4">
        <Loading />
      </div>
    );
  }

  return subtitles ? (
    <SubtitlesWrapper subtitles={subtitles} videoElement={videoElement} />
  ) : null;
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
      <BaseContentScript>
        <YoutubeSubtitles videoElement={videoElement[0] as HTMLVideoElement} />
      </BaseContentScript>
    </React.StrictMode>,
    shadowRoot
  );
};

init();
