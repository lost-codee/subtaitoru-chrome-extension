// Handle subtitle download requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRANSLATE") {
    (async () => {
      try {
        // Get API key from storage
        chrome.storage.local.get(["deeplApiKey"], async (result) => {
          const apiKey = result.deeplApiKey;
          if (!apiKey) {
            throw new Error("DeepL API key not found in storage");
          }

          try {
            const response = await fetch(
              "https://api-free.deepl.com/v2/translate",
              {
                method: "POST",
                headers: {
                  Authorization: `DeepL-Auth-Key ${apiKey}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  text: message.text,
                  target_lang: "EN",
                }),
              }
            );
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            sendResponse({ success: true, data });
          } catch (error: unknown) {
            console.error("Translation error:", error);
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        });
        return true; // Will respond asynchronously
      } catch (error) {
        console.error("Error translating text:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })();
    return true;
  }

  if (message.type === "FETCH_JISHO") {
    (async () => {
      try {
        const response = await fetch(
          `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(
            message.word
          )}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        sendResponse({
          success: true,
          data: data,
        });
      } catch (error) {
        console.error("Error fetching from Jisho:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })();
    return true;
  }

  if (message.type === "DOWNLOAD_SUBTITLE") {
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
          data: array,
        });
      } catch (error) {
        console.error("Error downloading subtitle:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })();
    return true;
  }

  if (message.type === "SEARCH_KITSUNEKKO") {
    (async () => {
      try {
        const response = await fetch(
          `https://kitsunekko.net/dirlist.php?dir=${message.query}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();

        sendResponse({
          success: true,
          data: text,
        });
      } catch (error) {
        console.error("Error searching Kitsunekko:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })();
    return true;
  }

  if (message.type === "FETCH_KITSUNEKKO_MAIN") {
    (async () => {
      try {
        const response = await fetch("https://kitsunekko.net/dirlist.php?dir=subtitles%2Fjapanese%2F");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        sendResponse({
          success: true,
          data: text,
        });
      } catch (error) {
        console.error("Error fetching Kitsunekko main page:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })();
    return true;
  }

  if (message.type === "SEARCH_DADDICTS") {
    (async () => {
      try {
        const response = await fetch(
          `https://d-addicts.com/forums/search.php?keywords=${encodeURIComponent(
            message.query
          )}+japanese+subtitles`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        sendResponse({
          success: true,
          data: text,
        });
      } catch (error) {
        console.error("Error searching D-Addicts:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })();
    return true;
  }
});
