// Constants
import { PLATFORMS } from "../lib/constants";

// Utils
import { getPlatform } from "../utils/get-platform";

// Inject scripts for a specific platform
const injectPlatformScripts = (tabId: number, platform: string) => {
  const scriptFiles: Record<string, string[]> = {
    [PLATFORMS.YOUTUBE]: ["js/youtube.js", "js/vendor.js"],
    [PLATFORMS.AMAZON_PRIME]: ["js/amazon.js", "js/vendor.js"],
  };

  const files = scriptFiles[platform];
  if (files) {
    chrome.scripting.executeScript({
      target: { tabId },
      files,
    });
  }
};

// Main script injection logic
const injectScripts = async (tabId: number, url: string) => {
  // check if storage has show subtitles enabled
  chrome.storage.local.get(["settings"], (result) => {
    if (!result?.settings?.showSubtitles) return;

    const platform = getPlatform(url);
    if (!platform) return;

    injectPlatformScripts(tabId, platform);
  });
};

// Handle tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const isTabReady =
    changeInfo.status === "complete" || changeInfo.audible === true;

  if (!isTabReady || !tab.url) return;

  injectScripts(tabId, tab.url);
});

// Handle tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    injectScripts(activeInfo.tabId, tab.url);
  }
});
