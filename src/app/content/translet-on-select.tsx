import React from "react";
import ReactDOM from "react-dom";
import { TranslationPopup } from "../../components/translation-popup";
import { TranslationFetcher } from "../../services/translation-fetcher";
import { createShadowContainer } from "../../utils/create-shadow-container";
import { Word } from "../../types";
import * as wanakana from "wanakana";

// Constants
const CONTEXT_MENU_ID = "translate-japanese-text";
const POPUP_CONTAINER_ID = "japanese-translation-popup";

class TransletOnSelected {
  private static instance: TransletOnSelected;
  private currentSelection: string = "";
  private currentPopup: HTMLElement | null = null;

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): TransletOnSelected {
    if (!TransletOnSelected.instance) {
      TransletOnSelected.instance = new TransletOnSelected();
    }
    return TransletOnSelected.instance;
  }

  private setupEventListeners() {
    // Listen for text selection
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    document.addEventListener("click", this.handleDocumentClick.bind(this));

    // Listen for context menu messages
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (
        request.type === "CONTEXT_MENU_CLICKED" &&
        request.menuItemId === CONTEXT_MENU_ID
      ) {
        this.handleContextMenuClick();
        sendResponse({ received: true });
      }
      return true; // Keep the message channel open for async response
    });
  }

  private handleMouseUp(event: MouseEvent) {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      this.currentSelection = selection.toString().trim();
    }
  }

  private handleDocumentClick(event: MouseEvent) {
    if (
      this.currentPopup &&
      event.target instanceof Node &&
      !this.currentPopup.contains(event.target)
    ) {
      this.removePopup();
    }
  }

  private async handleContextMenuClick() {
    // Check if a text is selected
    if (!this.currentSelection) {
      return;
    }

    // Check if the selected text is in Japanese
    if (!wanakana.isJapanese(this.currentSelection)) {
      return;
    }

    try {
      const wordData = await TranslationFetcher.fetchWordTranslation(
        this.currentSelection
      );

      // Check if the translation was successful
      if (!wordData) {
        return;
      }

      this.showTranslationPopup(wordData);
    } catch (error) {
      console.error("[JapaneseTranslator] Translation error:", error);
    }
  }

  private showTranslationPopup(wordData: Word) {
    this.removePopup();

    // Create container for the popup
    this.currentPopup = document.createElement("div");
    this.currentPopup.id = POPUP_CONTAINER_ID;

    // Position the popup near the selected text
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position the popup below the selected text
      const top = `${rect.bottom + window.scrollY + 10}px`;
      const left = `${rect.left + window.scrollX}px`;

      Object.assign(this.currentPopup.style, {
        position: "fixed",
        top,
        left,
        zIndex: "9999",
      });
    }

    document.body.appendChild(this.currentPopup);

    // Create shadow root and render popup
    const shadowRoot = createShadowContainer(POPUP_CONTAINER_ID);
    this.currentPopup.appendChild(shadowRoot.host);

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
  }

  private removePopup() {
    if (this.currentPopup) {
      ReactDOM.unmountComponentAtNode(this.currentPopup);
      this.currentPopup.remove();
      this.currentPopup = null;
    }
  }
}

// Initialize the translator when the content script loads
TransletOnSelected.getInstance();
