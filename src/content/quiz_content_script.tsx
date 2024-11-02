import React from "react";
import ReactDOM from "react-dom";

// Components
import { QuizPopup } from "../components/quiz-popup";

// utils
import { createShadowContainer } from "../utils/create-shadow-container";

const QUIZ_ROOT_ID = "subtaitoru-react-root-quiz";

const renderQuizPopup = () => {
  const alreadyRendered = document.getElementById(QUIZ_ROOT_ID);

  if (alreadyRendered) {
    // remove the old one
    alreadyRendered.parentNode?.removeChild(alreadyRendered);
    return;
  }

  const shadowRoot = createShadowContainer(QUIZ_ROOT_ID);
  document.body.appendChild(shadowRoot.host);

  const onClose = () => {
    ReactDOM.unmountComponentAtNode(shadowRoot);
    document.body.removeChild(shadowRoot.host);
  };

  ReactDOM.render(
    <React.StrictMode>
      <QuizPopup onClose={onClose} />
    </React.StrictMode>,
    shadowRoot
  );
};

renderQuizPopup();
