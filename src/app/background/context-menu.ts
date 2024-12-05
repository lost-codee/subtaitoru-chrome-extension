// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-japanese-text",
    title: "Translate Japanese Text",
    contexts: ["selection"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate-japanese-text" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "CONTEXT_MENU_CLICKED",
      text: info.selectionText,
    });
  }
});
