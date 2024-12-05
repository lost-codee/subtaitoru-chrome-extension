import { PLATFORMS } from "../../lib/constants";
import { getPlatform } from "../../utils/get-platform";

// Inject scripts for a specific platform
const injectPlatformScripts = (tabId: number, platform: string) => {
  const scriptFiles: Record<string, string[]> = {
    [PLATFORMS.YOUTUBE]: ["youtube.js"],
    [PLATFORMS.AMAZON_PRIME]: ["amazon.js"],
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
  const platform = getPlatform(url);
  if (!platform) return;
  injectPlatformScripts(tabId, platform);
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
