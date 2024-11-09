import React from "react";
import ReactDOM from "react-dom";

// Components
import { AmazonPrimeHelper } from "../helpers/amazon-prime-helper";

// utils
import { createShadowContainer } from "../utils/create-shadow-container";

const SUBTAITORU_ROOT_ID = "subtaitoru-react-root";

const renderSubtitles = (videoElement: HTMLVideoElement) => {
  if (document.getElementById(SUBTAITORU_ROOT_ID)) {
    return;
  }

  const shadowRoot = createShadowContainer(SUBTAITORU_ROOT_ID);
  videoElement.parentElement?.appendChild(shadowRoot.host);

  const videoContainer = document.getElementsByClassName(
    "webPlayerUIContainer"
  )[0];

  const checkMousePosition = (e: MouseEvent) => {
    const rect = videoContainer.getBoundingClientRect();

    const isMouseInContainer =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (isMouseInContainer) {
      videoElement.pause();
      videoElement.dataset.pausedByHover = "true";
    }
  };

  document.addEventListener("mousemove", checkMousePosition);

  // Cleanup function
  const cleanup = () => {
    document.removeEventListener("mousemove", checkMousePosition);
  };

  // Add cleanup to window unload
  window.addEventListener("unload", cleanup);

  ReactDOM.render(
    <React.StrictMode>
      <AmazonPrimeHelper videoElement={videoElement} />
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
