import React from "react";
import ReactDOM from "react-dom";

// Components
import { createShadowContainer } from "../utils/create-shadow-container";
import { YoutubeHelper } from "../helpers/youtube-helper";

const SUBTAITORU_ROOT_ID = "subtaitoru-react-root";

const renderSubtitles = (videoElement: HTMLVideoElement) => {
  if (document.getElementById(SUBTAITORU_ROOT_ID)) {
    return;
  }
  const shadowRoot = createShadowContainer(SUBTAITORU_ROOT_ID);
  videoElement.parentElement?.appendChild(shadowRoot.host);
  videoElement.style.position = "relative";

  ReactDOM.render(
    <React.StrictMode>
      <YoutubeHelper videoElement={videoElement} />
    </React.StrictMode>,
    shadowRoot
  );
};

const init = () => {
  const videoElement = document.getElementsByClassName(
    "video-stream html5-main-video"
  );

  if (videoElement && videoElement.length > 0) {
    renderSubtitles(videoElement[0] as HTMLVideoElement);
  }
};

init();
