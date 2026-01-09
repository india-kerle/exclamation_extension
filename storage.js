// Default settings for the extension
const DEFAULT_SETTINGS = {
  enabled: true,
  exclamationCount: 3,
  categories: {
    news: false,
    email: false,
    social: false
  },
  customSites: []
};

// Get all settings from storage
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
      resolve(result);
    });
  });
}

// Save settings to storage
async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, () => {
      resolve();
    });
  });
}

// Normalize a URL/hostname to bare domain
function normalizeSite(input) {
  let site = input.trim().toLowerCase();
  // Remove protocol
  site = site.replace(/^https?:\/\//, '');
  // Remove www.
  site = site.replace(/^www\./, '');
  // Remove path and trailing slash
  site = site.split('/')[0];
  return site;
}
