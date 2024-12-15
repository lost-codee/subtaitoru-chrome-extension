import React, { useState, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";

// Components
import { SubtitlesWrapper } from "../../components/subtitles-wrapper";
import {  LoadingIndicator } from "../../components/ui/loading";
import { SettingsProvider } from "../../context/settings-context";
import { SubtitlesList } from "../../components/subtitles-list";
import { ErrorBoundary } from "../../components/error-boundary";
import { useElementObserver } from "../../hooks/use-observer";

// Utils
import { createShadowContainer } from "../../utils/create-shadow-container";
import { tokenizeJapaneseText } from "../../utils/tokenize-japanese-text";
import { initializeErrorHandling } from "../../utils/error-handler";

// Constants
import { SUBTAITORU_ROOT_ID } from "../../lib/constants";
import { CaptionsTokenized } from "../../types";

interface YoutubeCaptions {
  start: number;
  end: number;
  text: string;
}

const YOUTUBE_SIDEBAR_SELECTOR = "[id='secondary'][class='style-scope ytd-watch-flexy']";
const YOUTUBE_AD_SELECTOR = ".video-ads .ytp-ad-player-overlay";

const YoutubeSubtitles = React.memo(
  ({ videoElement }: { videoElement: HTMLVideoElement }) => {
    const [captions, setCaptions] = useState<CaptionsTokenized[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const secondaryElement = useElementObserver(YOUTUBE_SIDEBAR_SELECTOR);
    const adsElement = useElementObserver(YOUTUBE_AD_SELECTOR);
    
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
        const tokenizeCaptions: CaptionsTokenized[] = parsedCaptions.map(
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
      if(adsElement || document.querySelector(YOUTUBE_AD_SELECTOR)) return;
      const videoId = new URLSearchParams(window.location.search).get("v");

      if (videoId) {
        fetchCaptions(videoId);
      }
    }, [adsElement]);

  
    useEffect(() => {
            // Cleanup existing subtitles list
            const existingList = document.getElementById("subtitles-list");
            if (existingList) {
              existingList.remove();
            }
            
      if (!secondaryElement || !videoElement || captions.length <= 0) return;

      let root: Root | null = null;
      let shadowRoot: ShadowRoot | null = null;
    
      // Double check elements still exist after timeout
      if (!secondaryElement || !videoElement) return;

        shadowRoot = createShadowContainer("subtitles-list");
        secondaryElement.insertBefore(shadowRoot.host, secondaryElement.firstChild);

        root = createRoot(shadowRoot);
        root.render(
            <ErrorBoundary>
              <SettingsProvider>
                <SubtitlesList captions={captions} videoElement={videoElement} />
              </SettingsProvider>
            </ErrorBoundary>
        );

      return () => {
        const existingList = document.getElementById("subtitles-list");
        if (existingList) {
          existingList.remove();
        }
      };
    }, [secondaryElement, captions, videoElement]);


    if (isLoading) {
      return (
        <div className="flex flex-col items-center p-4 justify-end z-[999] absolute h-full w-full bottom-12">
         <LoadingIndicator message="Loading Captions" />
        </div>
      );
    }
  
    return <SubtitlesWrapper subtitles={captions} videoElement={videoElement} />;
  }
);

const init = () => {
  // Initialize global error handling
  initializeErrorHandling();

  // If already rendered, exit
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
          <SettingsProvider>
            <YoutubeSubtitles videoElement={videoElement} />
          </SettingsProvider>
        </ErrorBoundary>
    
  );
};

init();
