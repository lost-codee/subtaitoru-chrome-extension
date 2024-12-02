import React, { useState, useEffect, memo } from "react";
import ReactDOM from "react-dom";

// Components
import { SubtitlesWrapper } from "../../components/subtitles-wrapper";
import { Loading } from "../../components/ui/loading";
import { VideoControls } from "../../components/video-controls";
import { StorageProvider } from "../../context/storage-context";

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
  // Try to get episode from Japanese subtitle text first
  const subtitleText = document.querySelector(
    ".atvwebplayersdk-subtitle-text"
  )?.textContent;
  console.log({ subtitleText });
  if (subtitleText) {
    // Match patterns like "シーズン1、エピソード1" or "第1話"
    const seasonMatch = subtitleText.match(/シーズン(\d+)/);
    const episodeMatch = subtitleText.match(/エピソード(\d+)|第(\d+)話/);

    if (episodeMatch) {
      const episodeNumber = parseInt(episodeMatch[1] || episodeMatch[2]);
      const seasonNumber = seasonMatch ? parseInt(seasonMatch[1]) : 1;

      console.log("Found episode info:", {
        season: seasonNumber,
        episode: episodeNumber,
      });
      return {
        episodeNumber,
        seasonNumber,
        rawTitle: subtitleText,
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
    const [subtitles, setSubtitles] = useState<string[] | null>(null);
    const [parsedSubtitles, setParsedSubtitles] = useState<
      ReturnType<typeof parseAssSubtitles>
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [subtitleOffset, setSubtitleOffset] = useState<number>(0);

    useEffect(() => {
      const fetchSubtitles = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const titleElement = document.querySelector(
            '[data-automation-id="title"]'
          );
          console.log({ titleElement });

          if (!titleElement) {
            throw new Error("Could not find title");
          }

          const title = titleElement.textContent?.trim() || "";
          const episodeInfo = getEpisodeInfo();

          if (!episodeInfo) {
            throw new Error("Could not determine episode information");
          }

          const searchParams = {
            title,
            ...(episodeInfo.isMovie
              ? { type: "movie" as const }
              : {
                  type: "series" as const,
                  episodeNumber: episodeInfo.episodeNumber,
                  seasonNumber: episodeInfo.seasonNumber,
                  rawTitle: episodeInfo.rawTitle,
                }),
          };

          const subtitleResults = await SubtitleFetcher.searchSubtitles(
            searchParams
          );

          if (!subtitleResults || subtitleResults.length === 0) {
            throw new Error("No Japanese subtitles found for this title");
          }

          console.log({ subtitleResults });

          // Try to download subtitles
          const subtitleContent = await SubtitleFetcher.downloadSubtitles(
            subtitleResults[0]
          );
          if (!subtitleContent) {
            throw new Error("Failed to download subtitles");
          }

          // Parse the downloaded subtitles
          const parsed = parseAssSubtitles(subtitleContent);
          console.log("Parsed subtitles:", parsed);
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

      fetchSubtitles();
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
        <div className="flex flex-col items-center p-4 justify-end z-[999] absolute h-full w-full bottom-12">
          <div className="bg-white text-black p-[8px] rounded-md text-center mb-[8px] animate-[fadeIn]">
            <div className="flex items-center text-[14px]">
              <span>Fetching Captions</span>
              <Loading />
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center p-4 justify-end z-[999] absolute h-full w-full bottom-12">
          <div className="bg-red-100 text-red-800 border border-red-300 p-[12px] rounded-md text-center mb-[8px] animate-[fadeIn] shadow-md">
            <div className="flex items-center text-[14px]">
              <svg
                className="w-[14px] h-[14px] mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
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

const renderSubtitles = (videoElement: HTMLVideoElement) => {
  const shadowRoot = createShadowContainer(SUBTAITORU_ROOT_ID);
  videoElement.parentElement?.appendChild(shadowRoot.host);
  ReactDOM.render(
    <React.StrictMode>
      <StorageProvider>
        <AmazonPrimeSubtitles videoElement={videoElement} />
      </StorageProvider>
    </React.StrictMode>,
    shadowRoot
  );
};

const init = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        const container = document.getElementsByClassName(
          "webPlayerSDKContainer"
        )[0];
        if (!container) return;

        const videoElement = container.querySelectorAll("video");
        if (videoElement && videoElement.length > 0) {
          const existingSubtitles = document.getElementById(SUBTAITORU_ROOT_ID);

          if (!existingSubtitles) {
            renderSubtitles(videoElement[0] as HTMLVideoElement);
          }
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

init();
