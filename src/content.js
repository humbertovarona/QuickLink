chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'getActiveTabUrl') {
    const activeTabUrl = window.location.href;
    sendResponse({ url: activeTabUrl });
  }
});
