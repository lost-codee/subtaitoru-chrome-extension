import React from "react";
import ReactDOM from "react-dom";

// Components
import { QuizPopup } from "../../components/quiz-popup";

// Utils
import { createShadowContainer } from "../../utils/create-shadow-container";

// Constants
import { QUIZ_ROOT_ID } from "../../lib/constants";

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
