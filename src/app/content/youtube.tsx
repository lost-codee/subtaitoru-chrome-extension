import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

// Components
import { SubtitlesWrapper } from "../../components/subtitles-wrapper";
import {  LoadingIndicator } from "../../components/ui/loading";
import { VideoControls } from "../../components/video-controls";
import { SettingsProvider } from "../../context/settings-context";
import { SubtitlesList } from "../../components/subtitles-list";
import { ErrorMessage } from "../../components/ui/error-message";
import { ErrorBoundary } from "../../components/error-boundary";

// Utils
import { createShadowContainer } from "../../utils/create-shadow-container";
import { tokenizeJapaneseText } from "../../utils/tokenize-japanese-text";
import { findCurrentCaption } from "../../utils/find-current-caption";
import { initializeErrorHandling } from "../../utils/error-handler";

// Constants
import { SUBTAITORU_ROOT_ID } from "../../lib/constants";
;

interface YoutubeCaptions {
  start: number;
  end: number;
  text: string;
}

export interface YoutubeCaptionsTokenize {
  start: number;
  end: number;
  text: string[];
}

const YoutubeSubtitles = React.memo(
  ({ videoElement }: { videoElement: HTMLVideoElement }) => {
    const [captions, setCaptions] = useState<YoutubeCaptionsTokenize[]>([]);
    const [subtitles, setSubtitles] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [subtitleOffset, setSubtitleOffset] = useState<number>(0);

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
          playerResponse.captions?.playerCaptionsTracklistRenderer
            ?.captionTracks;

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

        const parsedCaptions: YoutubeCaptions[] = Array.from(
          captionElements
        ).map((element) => ({
          start: parseFloat(element.getAttribute("start") || "0"),
          end:
            parseFloat(element.getAttribute("dur") || "0") +
            parseFloat(element.getAttribute("start") || "0"),
          text: element.textContent || "",
        }));

        // tokenize to japanese text
        const tokenizeCaptions: YoutubeCaptionsTokenize[] = parsedCaptions.map(
          (caption) => {
            const tokenize = tokenizeJapaneseText(caption.text);
            return { ...caption, text: tokenize };
          }
        );

        setCaptions(tokenizeCaptions);
      } catch (error) {
        console.error(
          "Error fetching captions: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
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

    useEffect(() => {
      if (!videoElement) return;

      let animationFrameId: any;

      const updateSubtitles = () => {
        const currentTime = videoElement.currentTime + (subtitleOffset || 0);
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
    }, [captions, videoElement, subtitleOffset]);

    useEffect(() => {
      const secondaryId = document.getElementById("secondary");
      if (secondaryId) {
        // Remove existing subtitles list if it exists
        const existingList = document.getElementById("subtitles-list");
        if (existingList) {
          existingList.remove();
        }

        const container = document.createElement("div");
        secondaryId.insertBefore(container, secondaryId.firstChild);

        const shadowRoot = createShadowContainer("subtitles-list");
        container.appendChild(shadowRoot.host);

        const root = createRoot(shadowRoot);

        root.render(
          <React.StrictMode>
            <SettingsProvider>
              <SubtitlesList captions={captions} videoElement={videoElement} />
            </SettingsProvider>
          </React.StrictMode>
        );
      }

      return () => {
        const subtitlesList = document.getElementById("subtitles-list");
        if (subtitlesList) {
          subtitlesList.remove();
        }
      };
    }, [captions, videoElement]);

    if (isLoading) {
      return (
        <div className="flex flex-col items-center p-4 justify-end z-[999] absolute h-full w-full bottom-12">
         <LoadingIndicator message="Loading Captions" />
        </div>
      );
    }

    return (
      <>
        <VideoControls
          onOffsetChange={setSubtitleOffset}
          currentOffset={subtitleOffset}
        />
        <SubtitlesWrapper subtitles={subtitles} videoElement={videoElement} />
      </>
    );
  }
);

const init = () => {
  // Initialize global error handling
  initializeErrorHandling();
  if (document.getElementById(SUBTAITORU_ROOT_ID)) {
    return;
  }

  const videoElement = document.querySelector<HTMLVideoElement>(
    ".video-stream.html5-main-video"
  );
  if (!videoElement) return;

  const container = document.getElementById("ytp-caption-window-container");
  if (!container) return;

  // Create shadow DOM container
  const shadowRoot = createShadowContainer(SUBTAITORU_ROOT_ID);
  container.appendChild(shadowRoot.host);

  const root = createRoot(shadowRoot);
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <SettingsProvider>
          <YoutubeSubtitles videoElement={videoElement} />
        </SettingsProvider>
      </React.StrictMode>
    </ErrorBoundary>
  );
};

init();
