import React, { useState, useEffect, memo, useRef } from "react";
import { createRoot } from "react-dom/client";

// Components
import { SubtitlesWrapper } from "../../components/subtitles-wrapper";
import { LoadingIndicator } from "../../components/ui/loading";
import { VideoControls } from "../../components/video-controls";
import { SettingsProvider } from "../../context/settings-context";
import { ToastManager } from "../../components/ui/toast";
import { ErrorMessage } from "../../components/ui/error-message";

// Utils
import { createShadowContainer } from "../../utils/create-shadow-container";
import { tokenizeJapaneseText } from "../../utils/tokenize-japanese-text";
import { SubtitleFetcher } from "../../services/subtitle-fetcher";
import {
  parseAssSubtitles,
  findCurrentSubtitles,
} from "../../utils/subtitle-parser";

// Constants
import { SUBTAITORU_ROOT_ID } from "../../lib/constants";

const getEpisodeInfo = () => {
  const subtitleText = document.querySelector(
    ".atvwebplayersdk-subtitle-text"
  )?.textContent;
  if (subtitleText) {
    // Match Japanese patterns like "シーズン1、エピソード1" or "第1話"
    const jpSeasonMatch = subtitleText.match(/シーズン(\d+)/);
    const jpEpisodeMatch = subtitleText.match(/エピソード(\d+)|第(\d+)話/);

    // Match English patterns like "Season 1" and "Episode 1" or "S1 E1" or "S01E01"
    const enSeasonMatch = subtitleText.match(/Season\s*(\d+)|S(\d+)/i);
    const enEpisodeMatch = subtitleText.match(/Episode\s*(\d+)|E(\d+)/i);

    // Get episode number from either Japanese or English pattern
    const episodeNumber = jpEpisodeMatch
      ? parseInt(jpEpisodeMatch[1] || jpEpisodeMatch[2])
      : enEpisodeMatch
        ? parseInt(enEpisodeMatch[1] || enEpisodeMatch[2])
        : null;

    // Get season number from either Japanese or English pattern
    const seasonNumber = jpSeasonMatch
      ? parseInt(jpSeasonMatch[1])
      : enSeasonMatch
        ? parseInt(enSeasonMatch[1] || enSeasonMatch[2])
        : 1; // Default to season 1 if not found

    if (episodeNumber) {
      return {
        episodeNumber,
        seasonNumber,
      };
    }
  }

  // Try to get episode from URL
  const urlParams = new URLSearchParams(window.location.search);
  const episodeFromUrl = urlParams.get("episodeNumber");

  if (episodeFromUrl) {
    return {
      episodeNumber: parseInt(episodeFromUrl),
      seasonNumber: 1,
    };
  }

  // If we can't find episode number, check if it's a movie
  const movieIndicator = document.querySelector(
    '[data-automation-id="runtime-badge"]'
  );
  if (movieIndicator) {
    return { isMovie: true };
  }

  return null;
};

const AmazonPrimeSubtitles = memo(
  ({ videoElement }: { videoElement: HTMLVideoElement }) => {
    const [parsedSubtitles, setParsedSubtitles] = useState<
      ReturnType<typeof parseAssSubtitles>
    >([]);
    const [subtitles, setSubtitles] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [subtitleOffset, setSubtitleOffset] = useState<number>(0);
    const [currentEpisodeInfo, setCurrentEpisodeInfo] = useState<string | null>(
      null
    );

    const fetchSubtitles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const titleElement = document.querySelector(
          '[data-automation-id="title"]'
        );

        if (!titleElement) {
          throw new Error("Could not find title");
        }

        const title = titleElement.textContent?.trim() || "";
        const episodeInfo = getEpisodeInfo();

        if (!episodeInfo) {
          throw new Error("Could not determine episode information");
        }

        // Create a unique identifier for the current episode state
        const episodeState = JSON.stringify({
          title,
          ...episodeInfo,
        });

        // If we're already showing subtitles for this episode state, don't fetch again
        if (episodeState === currentEpisodeInfo) {
          setIsLoading(false);
          return;
        }

        setCurrentEpisodeInfo(episodeState);

        const searchParams = {
          title,
          ...(episodeInfo.isMovie
            ? { type: "movie" as const }
            : {
                type: "series" as const,
                episodeNumber: episodeInfo.episodeNumber,
                seasonNumber: episodeInfo.seasonNumber,
              }),
        };

        const subtitleResults = await SubtitleFetcher.searchSubtitles(
          searchParams
        );

        if (!subtitleResults || subtitleResults.length === 0) {
          throw new Error("No Japanese subtitles found for this title");
        }

        // Try to download subtitles
        const subtitleContent = await SubtitleFetcher.downloadSubtitles(
          subtitleResults[0]
        );
        if (!subtitleContent) {
          throw new Error("Failed to download subtitles");
        }

        // Parse the downloaded subtitles
        const parsed = parseAssSubtitles(subtitleContent);
        setParsedSubtitles(parsed);
      } catch (error) {
        setError(
          "Error fetching captions: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
        console.error("Error fetching subtitles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    useEffect(() => {
      fetchSubtitles();
    }, []);

    // Watch for subtitle text changes
    useEffect(() => {
      const subtitleElement = document.querySelector(
        ".atvwebplayersdk-subtitle-text"
      );
      if (!subtitleElement) return;

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData" || mutation.type === "childList") {
            // Debounce the fetch call to prevent multiple rapid fetches
            const timeoutId = setTimeout(() => {
              fetchSubtitles();
            }, 500);
            return () => clearTimeout(timeoutId);
          }
        }
      });

      observer.observe(subtitleElement, {
        childList: true,
        characterData: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }, []);

    // Update current subtitles based on video time
    useEffect(() => {
      if (!videoElement || parsedSubtitles.length === 0) return;

      const updateSubtitles = () => {
        // Apply the offset to the current time
        const currentTime = videoElement.currentTime + (subtitleOffset || 0);
        const currentSubs = findCurrentSubtitles(parsedSubtitles, currentTime);
        const tokenizedSubs = currentSubs
          ? tokenizeJapaneseText(currentSubs)
          : null;
        setSubtitles(tokenizedSubs);
      };

      // Update initially
      updateSubtitles();

      // Add event listeners for time updates
      videoElement.addEventListener("timeupdate", updateSubtitles);
      videoElement.addEventListener("seeking", updateSubtitles);

      return () => {
        videoElement.removeEventListener("timeupdate", updateSubtitles);
        videoElement.removeEventListener("seeking", updateSubtitles);
      };
    }, [videoElement, parsedSubtitles, subtitleOffset]);

    if (isLoading) {
      return (
        <div className="flex flex-col items-center p-4 justify-end z-[999] absolute w-full h-full bottom-12 pointer-events-none">
          <LoadingIndicator message="Searching for captions" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center p-4 justify-end z-[999] absolute w-full h-full bottom-12 pointer-events-none">
          <ErrorMessage 
            error={error} 
            onClose={() => setError(null)}
          />
        </div>
      );
    }

    return (
      <>
        <VideoControls
          onOffsetChange={setSubtitleOffset}
          currentOffset={subtitleOffset}
        />
        <SubtitlesWrapper subtitles={subtitles} videoElement={videoElement!} />
      </>
    );
  }
);

const init = () => {
  if (document.getElementById(SUBTAITORU_ROOT_ID)) {
    return;
  }
  
  // Show experimental feature toast
  ToastManager.show({
    message: "Amazon Prime support is experimental and may not work as expected.",
    type: "warning",
    duration: 7000,
  });

  const container = document.querySelector(".webPlayerSDKContainer");
  if (!container) return;

  const videoElements = container.querySelectorAll("video");

  if (!videoElements || videoElements.length === 0) return;

  // Create shadow DOM container
  const shadowRoot = createShadowContainer(SUBTAITORU_ROOT_ID);
  container.appendChild(shadowRoot.host);

  const root = createRoot(shadowRoot);
  root.render(
    <React.StrictMode>
      <SettingsProvider>
        <AmazonPrimeSubtitles videoElement={videoElements[0]} />
      </SettingsProvider>
    </React.StrictMode>
  );
};

init();