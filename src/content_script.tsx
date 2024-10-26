import React from "react";
import ReactDOM from "react-dom";

// Utilities
import { getPlatform } from "./utils/get-platform";

// Components
import { AmazonPrimeHelper } from "./helpers/amazon-prime-helper";
import { ManuallyUploadHelper } from "./helpers/manually-upload-helper";
import { YoutubeHelper } from "./helpers/youtube-helper";
import { QuizPopup } from "./components/quiz-popup";

// Constants
import { SHOW_QUIZ_POPUP } from "./constants/message";

// Styles
import shadowStyles from "./generated-shadow-styles.css";
import { doc } from "prettier";

const SUBTAITORU_ROOT_ID = "subtaitoru-react-root";
const QUIZ_ROOT_ID = "subtaitoru-quiz-react-root";

/**
 * Creates a container with Shadow DOM to isolate styles.
 */
const createShadowContainer = (id: string): ShadowRoot => {
  const container = document.createElement("div");
  container.id = id;
  const shadowRoot = container.attachShadow({ mode: "closed" });
  const stylesheet = new CSSStyleSheet();
  stylesheet.replaceSync(shadowStyles);
  shadowRoot.adoptedStyleSheets = [stylesheet];
  return shadowRoot;
};

/**
 * Renders the appropriate subtitle component based on the platform.
 */
const SubtitleRenderer: React.FC<{
  platform: string;
  videoElement: HTMLVideoElement;
}> = ({ platform, videoElement }) => {
  switch (platform) {
    case "amazonPrime":
      return <AmazonPrimeHelper videoElement={videoElement} />;
    case "youtube":
      videoElement.style.position = "relative";
      return <YoutubeHelper videoElement={videoElement} />;
    default:
      return <ManuallyUploadHelper />;
  }
};

/**
 * Mounts a React component into the shadow DOM for subtitles.
 */
const renderSubtitles = (platform: string, videoElement: HTMLVideoElement) => {
  const shadowRoot = createShadowContainer(SUBTAITORU_ROOT_ID);
  videoElement.parentElement?.appendChild(shadowRoot.host);

  ReactDOM.render(
    <React.StrictMode>
      <SubtitleRenderer platform={platform} videoElement={videoElement} />
    </React.StrictMode>,
    shadowRoot
  );
};

/**
 * Renders the Quiz Popup in the main DOM.
 */
const renderQuizPopup = () => {
  if (document.getElementById(QUIZ_ROOT_ID)) {
    return;
  }

  const shadowRoot = createShadowContainer(QUIZ_ROOT_ID);
  document.body.appendChild(shadowRoot.host);

  const onClose = () => {
    ReactDOM.unmountComponentAtNode(shadowRoot);
    document.body.removeChild(shadowRoot.host);
  };

  // Render the quiz popup
  ReactDOM.render(
    <React.StrictMode>
      <QuizPopup onClose={onClose} />
    </React.StrictMode>,
    shadowRoot
  );
};

/**
 * Observes DOM changes and initializes subtitle rendering.
 */
const initSubtitleObserver = () => {
  const observer = new MutationObserver(() => {
    chrome.storage.local.get(["showSubtitles"], (result) => {
      if (result.showSubtitles) {
        const platform = getPlatform();
        if (!platform) return;

        // Find all video elements
        const videoElements = document.querySelectorAll("video");
        if (videoElements.length === 0) return;

        // Render the correct subtitle handler based on platform
        const targetVideo =
          platform === "amazonPrime" && videoElements.length >= 1
            ? videoElements[1]
            : videoElements[0];

        // check if already rendered or no target video
        if (document.getElementById(SUBTAITORU_ROOT_ID) || !targetVideo) return;

        renderSubtitles(platform, targetVideo);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

/**
 * Listens for messages from the extension popup for quiz actions.
 */
const initMessageListener = () => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === SHOW_QUIZ_POPUP) {
      renderQuizPopup();
    }
  });
};

// Initialize observers and listenerss
initSubtitleObserver();
initMessageListener();
