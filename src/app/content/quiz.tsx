import React from "react";
import { createRoot } from "react-dom/client";

// Components
import { QuizPopup } from "../../components/quiz-popup";
import { ErrorBoundary } from "../../components/error-boundary";

// Utils
import { createShadowContainer } from "../../utils/create-shadow-container";
import { initializeErrorHandling } from "../../utils/error-handler";

// Constants
import { QUIZ_ROOT_ID } from "../../lib/constants";


const renderQuizPopup = () => {
  // Initialize global error handling
  initializeErrorHandling();

  const alreadyRendered = document.getElementById(QUIZ_ROOT_ID);

  if (alreadyRendered) {
    // remove the old one
    alreadyRendered.parentNode?.removeChild(alreadyRendered);
    return;
  }

  const shadowRoot = createShadowContainer(QUIZ_ROOT_ID);
  document.body.appendChild(shadowRoot.host);

  const root = createRoot(shadowRoot);

  const onClose = () => {
    root.unmount();
    document.body.removeChild(shadowRoot.host);
  };

  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <QuizPopup onClose={onClose} />
      </React.StrictMode>
    </ErrorBoundary>
  );

};

renderQuizPopup();
