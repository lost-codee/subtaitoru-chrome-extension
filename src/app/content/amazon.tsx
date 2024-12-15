import React, { useState, useEffect, memo } from "react";
import { createRoot } from "react-dom/client";

// Components
import { SubtitlesWrapper } from "../../components/subtitles-wrapper";
import { LoadingIndicator } from "../../components/ui/loading";
import { SettingsProvider } from "../../context/settings-context";
import { ToastManager } from "../../components/ui/toast";
import { ErrorBoundary } from "../../components/error-boundary";

// Utils
import { createShadowContainer } from "../../utils/create-shadow-container";
import { SubtitleFetcher } from "../../services/subtitle-fetcher";
import {
  parseAssSubtitles,
  parseSrtSubtitles,
} from "../../utils/subtitle-parser";
import { initializeErrorHandling } from "../../utils/error-handler";

// Constants
import { SUBTAITORU_ROOT_ID } from "../../lib/constants";
import { CaptionsTokenized } from "../../types";
import { tokenizeJapaneseText } from "../../utils/tokenize-japanese-text";

const getEpisodeInfo = (targetElement: Element) => {

  const subtitleText = targetElement.querySelector(
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
  ({ videoElement, targetElement }: { videoElement: HTMLVideoElement, targetElement: Element }) => {
    const [captions, setCaptions] = useState<CaptionsTokenized[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentEpisodeInfo, setCurrentEpisodeInfo] = useState<string | null>(null);

    const fetchSubtitles = async () => {
      setIsLoading(true);
      try {
        const titleElement = document.querySelector(
          '[data-automation-id="title"]'
        );

        if (!titleElement) {
          throw new Error("Could not find title");
        }

        const title = titleElement.textContent?.trim() || "";
        // pause execution for 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));

        const episodeInfo = getEpisodeInfo(targetElement);

        if (!episodeInfo) {
           return;
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

        // Parse the downloaded subtitles based on file extension
        const isAss = subtitleResults[0].url.toLowerCase().endsWith('.ass');
        const parsed = isAss ? 
          parseAssSubtitles(subtitleContent) : 
          parseSrtSubtitles(subtitleContent);

        // tokenize subtitles
        const tokenizeCaptions: CaptionsTokenized[] = parsed.map(
          (caption) => {
            const tokenize = tokenizeJapaneseText(caption.text);
            return { ...caption, text: tokenize };
          }
        );

        setCaptions(tokenizeCaptions);

      } catch (error) {
        console.error("Error fetching subtitles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    useEffect(() => {
      fetchSubtitles();
    }, []);

    if (isLoading) {
      return (
        <div className="flex flex-col items-center p-4 justify-end z-[999] absolute w-full h-full bottom-12 pointer-events-none">
          <LoadingIndicator message="Searching for captions" />
        </div>
      );
    }

    return  <SubtitlesWrapper subtitles={captions} videoElement={videoElement} />;
  }
);

const init = () => {
  if (document.getElementById(SUBTAITORU_ROOT_ID)) {
    return;
  }

  // if amazon prime is disabled from settings, exit
  chrome.storage.local.get("amazonScript").then((result) => {
    if (!result.amazonScript?.enabled) {
      return;
    }
  });

  // Initialize global error handling
  initializeErrorHandling();

  // Show experimental feature toast
  ToastManager.show({
    message: "Amazon Prime support is experimental and may not work as expected.",
    type: "warning",
    duration: 7000,
  });

  // Get both possible containers
  const containers = [
    document.querySelector("#dv-web-player"),
    document.querySelector("#dv-web-player-2")
  ].filter(Boolean);

  if (containers.length === 0) return;

  let root: any = null;
  let shadowRoot: any = null;

  const mountComponent = (targetContainer: Element) => {
    const videoElements = targetContainer.querySelectorAll("video");
    if (!videoElements || videoElements.length === 0) return;

    if (shadowRoot) {
      shadowRoot.host.remove();
    }
    if (root) {
      root.unmount();
    }

    shadowRoot = createShadowContainer(SUBTAITORU_ROOT_ID);
    targetContainer.appendChild(shadowRoot.host);

    root = createRoot(shadowRoot);
    root.render(
      <ErrorBoundary>
        <React.StrictMode>
          <SettingsProvider>
            <AmazonPrimeSubtitles videoElement={videoElements[0]} targetElement={targetContainer} />
          </SettingsProvider>
        </React.StrictMode>
      </ErrorBoundary>
    );
  };

  // Create a mutation observer to watch for fullscreen class changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        const target = mutation.target as HTMLElement;
        if (target.classList.contains("dv-player-fullscreen")) {
          mountComponent(target);
        }
      }
    });
  });

  // Start observing both containers
  containers.forEach(container => {
    observer.observe(container!, {
      attributes: true,
      attributeFilter: ["class"]
    });
  });

  // Initial mount on the container that has the fullscreen class
  const initialFullscreenContainer = containers.find(
    container => container?.classList.contains("dv-player-fullscreen")
  );
  
  if (initialFullscreenContainer) {
    mountComponent(initialFullscreenContainer);
  } else if (containers.length > 0 && containers[0]) {
    // If no container has fullscreen class yet, mount on the first available container
    mountComponent(containers[0]);
  }
};

init();


