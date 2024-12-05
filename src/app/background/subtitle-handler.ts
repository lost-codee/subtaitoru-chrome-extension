// Handle subtitle download requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOWNLOAD_SUBTITLE') {
    (async () => {
      try {
        const response = await fetch(message.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const array = Array.from(uint8Array);
        
        sendResponse({
          success: true,
          data: array
        });
      } catch (error) {
        console.error('Error downloading subtitle:', error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    })();
    return true;
  }

  if (message.type === 'SEARCH_KITSUNEKKO') {
    (async () => {
      try {
        const response = await fetch(`https://kitsunekko.net/dirlist.php?dir=subtitles%2Fjapanese%2F${encodeURIComponent(message.query)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        sendResponse({
          success: true,
          data: text
        });
      } catch (error) {
        console.error('Error searching Kitsunekko:', error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    })();
    return true;
  }

  if (message.type === 'SEARCH_DADDICTS') {
    (async () => {
      try {
        const response = await fetch(`https://d-addicts.com/forums/search.php?keywords=${encodeURIComponent(message.query)}+japanese+subtitles`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        sendResponse({
          success: true,
          data: text
        });
      } catch (error) {
        console.error('Error searching D-Addicts:', error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    })();
    return true;
  }
});
