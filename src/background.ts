// background.ts
import { getPlatform, PLATFORMS } from "./utils/get-platform";

// Function to inject scripts based on platform
const injectScripts = (tabId: number, url: string) => {
  // check if show subtitles is enable
  chrome.storage.local.get(["showSubtitles"], (result) => {
    if (result.showSubtitles) {
      const platform = getPlatform(url);
      switch (platform) {
        case PLATFORMS.YOUTUBE:
          chrome.scripting.executeScript({
            target: { tabId },
            files: ["js/youtube.js", "js/vendor.js"],
          });
          break;
        case PLATFORMS.AMAZON_PRIME:
          chrome.scripting.executeScript({
            target: { tabId },
            files: ["js/amazon.js", "js/vendor.js"],
          });
          break;
        default:
          break;
      }
    }
  });
};

// Listen for updates in the tab status (e.g., loading complete or audible change)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.audible === true) {
    injectScripts(tabId, tab.url || "");
  }
});

// Listen for tab switches to re-inject the script if necessary
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    injectScripts(activeInfo.tabId, tab.url);
  }
});
