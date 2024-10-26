let currentTabId: number | null = null;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url?.includes("youtube.com/watch")
  ) {
    currentTabId = tabId;
    console.log("Current tab ID:", currentTabId);
  }
});
