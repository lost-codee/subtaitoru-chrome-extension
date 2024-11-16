window.addEventListener("message", (event) => {
  // Ensure that the message is coming from the React app
  if (event.source !== window || event.data.type !== "SEND_TOKEN") {
    return;
  }

  // Send the token to the background script
  chrome.runtime.sendMessage({ token: event.data.token });
});
