// Pre-defined site categories for the exclamation extension
const SITE_CATEGORIES = {
  news: [
    'cnn.com',
    'bbc.com',
    'bbc.co.uk',
    'nytimes.com',
    'theguardian.com',
    'washingtonpost.com',
    'reuters.com',
    'apnews.com',
    'npr.org'
  ],
  email: [
    'mail.google.com',
    'outlook.live.com',
    'outlook.office.com',
    'mail.yahoo.com',
    'proton.me',
    'protonmail.com'
  ],
  social: [
    'twitter.com',
    'x.com',
    'facebook.com',
    'instagram.com',
    'linkedin.com',
    'threads.net',
    'bsky.app',
    'mastodon.social'
  ]
};

// Check if a hostname matches any site in a category
function hostnameMatchesSite(hostname, site) {
  // Exact match or subdomain match
  return hostname === site || hostname.endsWith('.' + site);
}

// Check if hostname is in any enabled category or custom sites
function isHostnameAllowed(hostname, settings) {
  // Check custom sites first
  if (settings.customSites && settings.customSites.length > 0) {
    for (const site of settings.customSites) {
      if (hostnameMatchesSite(hostname, site)) {
        return true;
      }
    }
  }

  // Check each enabled category
  for (const [category, enabled] of Object.entries(settings.categories)) {
    if (enabled && SITE_CATEGORIES[category]) {
      for (const site of SITE_CATEGORIES[category]) {
        if (hostnameMatchesSite(hostname, site)) {
          return true;
        }
      }
    }
  }

  return false;
}
