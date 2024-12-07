// Initialize script injection
import './script-injection';

// Initialize subtitle handling
import './subtitle-handler';


// Initialize environment variables in Chrome storage
chrome.runtime.onInstalled.addListener(() => {
  if (!process.env.DEEPL_API_KEY) {
    console.error('DEEPL_API_KEY not found in environment variables');
    return;
  }
  
  chrome.storage.local.set({ deeplApiKey: process.env.DEEPL_API_KEY }, () => {
    console.log('DeepL API key initialized in storage');
  });
});
