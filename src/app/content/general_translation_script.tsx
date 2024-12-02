import React from "react";
import ReactDOM from "react-dom";
import { TranslationPopup } from "../../components/translation-popup";
import { translationService } from "../../services/api";
import { createShadowContainer } from "../../utils/create-shadow-container";
import { Word } from "../../types";
import * as wanakana from "wanakana";

// Constants
const CONTEXT_MENU_ID = "translate-japanese-text";
const POPUP_CONTAINER_ID = "japanese-translation-popup";

class JapaneseTranslator {
  private static instance: JapaneseTranslator;
  private currentSelection: string = "";
  private currentPopup: HTMLElement | null = null;

  private constructor() {
    console.log("[JapaneseTranslator] Initializing translator...");
    this.setupEventListeners();
    console.log("[JapaneseTranslator] Initialization complete");
  }

  public static getInstance(): JapaneseTranslator {
    console.log("[JapaneseTranslator] Getting instance...");
    if (!JapaneseTranslator.instance) {
      console.log("[JapaneseTranslator] Creating new instance");
      JapaneseTranslator.instance = new JapaneseTranslator();
    }
    return JapaneseTranslator.instance;
  }

  private setupEventListeners() {
    console.log("[JapaneseTranslator] Setting up event listeners");

    // Listen for text selection
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    document.addEventListener("click", this.handleDocumentClick.bind(this));

    // Listen for context menu messages
    console.log("[JapaneseTranslator] Setting up message listener");
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("[JapaneseTranslator] Received message:", request);

      if (
        request.type === "CONTEXT_MENU_CLICKED" &&
        request.menuItemId === CONTEXT_MENU_ID
      ) {
        console.log(
          "[JapaneseTranslator] Context menu clicked, current selection:",
          this.currentSelection
        );
        this.handleContextMenuClick();
        sendResponse({ received: true });
      }
      return true; // Keep the message channel open for async response
    });
    console.log("[JapaneseTranslator] Event listeners setup complete");
  }

  private handleMouseUp(event: MouseEvent) {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      this.currentSelection = selection.toString().trim();
      console.log(
        "[JapaneseTranslator] New text selected:",
        this.currentSelection
      );

      // Log if the selected text is Japanese
      if (wanakana.isJapanese(this.currentSelection)) {
        console.log("[JapaneseTranslator] Selected text is Japanese");
      } else {
        console.log("[JapaneseTranslator] Selected text is not Japanese");
      }
    }
  }

  private handleDocumentClick(event: MouseEvent) {
    if (
      this.currentPopup &&
      event.target instanceof Node &&
      !this.currentPopup.contains(event.target)
    ) {
      console.log("[JapaneseTranslator] Clicked outside popup, removing");
      this.removePopup();
    }
  }

  private async handleContextMenuClick() {
    console.log("[JapaneseTranslator] Handling context menu click");
    console.log(
      "[JapaneseTranslator] Current selection:",
      this.currentSelection
    );

    if (!this.currentSelection) {
      console.log("[JapaneseTranslator] No text selected");
      return;
    }

    if (!wanakana.isJapanese(this.currentSelection)) {
      console.log("[JapaneseTranslator] Selected text is not Japanese");
      return;
    }

    try {
      console.log(
        "[JapaneseTranslator] Fetching translation for:",
        this.currentSelection
      );
      const wordData = await translationService.fetchWordTranslation(
        this.currentSelection
      );

      if (!wordData) {
        console.log("[JapaneseTranslator] No translation found");
        return;
      }

      console.log("[JapaneseTranslator] Translation received:", wordData);
      this.showTranslationPopup(wordData);
    } catch (error) {
      console.error("[JapaneseTranslator] Translation error:", error);
    }
  }

  private showTranslationPopup(wordData: Word) {
    console.log("[JapaneseTranslator] Showing translation popup");
    this.removePopup();

    // Create container for the popup
    this.currentPopup = document.createElement("div");
    this.currentPopup.id = POPUP_CONTAINER_ID;

    // Position the popup near the selected text
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const top = `${rect.bottom + window.scrollY + 10}px`;
      const left = `${rect.left + window.scrollX}px`;
      console.log("[JapaneseTranslator] Positioning popup at:", { top, left });

      Object.assign(this.currentPopup.style, {
        position: "fixed",
        top,
        left,
        zIndex: "9999",
      });
    }

    document.body.appendChild(this.currentPopup);
    console.log("[JapaneseTranslator] Popup container added to document");

    // Create shadow root and render popup
    const shadowRoot = createShadowContainer(POPUP_CONTAINER_ID);
    this.currentPopup.appendChild(shadowRoot.host);
    console.log("[JapaneseTranslator] Shadow container created");

    ReactDOM.render(
      <React.StrictMode>
        <TranslationPopup
          word={wordData}
          onClose={() => this.removePopup()}
          isCached={false}
        />
      </React.StrictMode>,
      shadowRoot
    );
    console.log("[JapaneseTranslator] Popup rendered");
  }

  private removePopup() {
    if (this.currentPopup) {
      console.log("[JapaneseTranslator] Removing popup");
      ReactDOM.unmountComponentAtNode(this.currentPopup);
      this.currentPopup.remove();
      this.currentPopup = null;
      console.log("[JapaneseTranslator] Popup removed");
    }
  }
}

console.log("[JapaneseTranslator] Content script loaded");
// Initialize the translator when the content script loads
JapaneseTranslator.getInstance();
