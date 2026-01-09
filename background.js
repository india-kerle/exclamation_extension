// Background service worker for Exclamation Propagandist

// Initialize default settings on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      exclamationCount: 3,
      categories: {
        news: false,
        email: false,
        social: false
      },
      customSites: []
    });
    console.log('Exclamation Propagandist installed with default settings');
  }
});
