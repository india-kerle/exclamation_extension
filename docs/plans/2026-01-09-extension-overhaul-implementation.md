# Exclamation Extension Overhaul - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the basic period-to-exclamation extension into a configurable tool with allowlist-based site targeting, customizable exclamation count, and a soft/cute UI.

**Architecture:** Content script checks chrome.storage for settings before modifying pages. Popup provides UI for toggling categories, setting exclamation count, and managing custom sites. Background service worker initializes defaults on install.

**Tech Stack:** Chrome Extension Manifest V3, vanilla JavaScript, CSS3, chrome.storage.sync API

---

## Task 1: Create Site Categories Module

**Files:**
- Create: `sites.js`

**Step 1: Create sites.js with pre-defined categories**

```javascript
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
```

**Step 2: Verify file created**

Open `sites.js` in editor and confirm syntax is correct.

**Step 3: Commit**

```bash
git add sites.js
git commit -m "feat: add pre-defined site categories module"
```

---

## Task 2: Create Storage Utilities Module

**Files:**
- Create: `storage.js`

**Step 1: Create storage.js with defaults and helpers**

```javascript
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
```

**Step 2: Verify file created**

Open `storage.js` in editor and confirm syntax is correct.

**Step 3: Commit**

```bash
git add storage.js
git commit -m "feat: add storage utilities module"
```

---

## Task 3: Update Manifest

**Files:**
- Modify: `manifest.json`

**Step 1: Update manifest.json with new permissions and files**

Replace entire contents with:

```json
{
  "manifest_version": 3,
  "name": "Exclamation Propagandist",
  "short_name": "Exclamation!!!",
  "description": "Experience the internet more hysterically - replaces periods with exclamation points",
  "author": "India Kerle",
  "version": "1.0.0",

  "icons": {
    "16": "logo/exclamation-16.png",
    "48": "logo/exclamation-48.png",
    "128": "logo/exclamation-128.png"
  },

  "action": {
    "default_title": "Exclamation Propagandist",
    "default_popup": "popup/popup.html"
  },

  "permissions": [
    "storage"
  ],

  "background": {
    "service_worker": "background.js"
  },

  "content_scripts": [
    {
      "matches": ["*://*/*"],
      "js": ["storage.js", "sites.js", "content_script.js"],
      "run_at": "document_end"
    }
  ]
}
```

**Step 2: Verify JSON is valid**

Open `manifest.json` in editor - no red squiggles.

**Step 3: Commit**

```bash
git add manifest.json
git commit -m "feat: update manifest with storage permission and background worker"
```

---

## Task 4: Create Background Service Worker

**Files:**
- Create: `background.js`

**Step 1: Create background.js**

```javascript
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
```

**Step 2: Verify file created**

Open `background.js` in editor and confirm syntax is correct.

**Step 3: Commit**

```bash
git add background.js
git commit -m "feat: add background service worker for initialization"
```

---

## Task 5: Rewrite Content Script

**Files:**
- Modify: `content_script.js`

**Step 1: Replace content_script.js entirely**

```javascript
// Exclamation Propagandist - Content Script
// Replaces sentence-ending periods with exclamation points

(async function() {
  // Get current settings
  const settings = await getSettings();

  // Check if extension is enabled
  if (!settings.enabled) {
    return;
  }

  // Check if current site is allowed
  const hostname = window.location.hostname.replace(/^www\./, '');
  if (!isHostnameAllowed(hostname, settings)) {
    return;
  }

  // Build the replacement string
  const exclamations = '!'.repeat(settings.exclamationCount);

  // Regex for sentence-ending periods
  // Matches period followed by: whitespace, end of string, or closing punctuation
  const periodRegex = /\.(?=\s|$|["'"'\)\]])/g;

  function replaceText(text) {
    return text.replace(periodRegex, exclamations);
  }

  function handleTextNode(textNode) {
    const newValue = replaceText(textNode.nodeValue);
    if (newValue !== textNode.nodeValue) {
      textNode.nodeValue = newValue;
    }
  }

  function walkTree(rootNode) {
    const walker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (!isForbiddenNode(node)) {
        handleTextNode(node);
      }
    }
  }

  function isForbiddenNode(node) {
    // Don't modify editable content
    if (node.isContentEditable) return true;
    if (node.parentNode && node.parentNode.isContentEditable) return true;

    // Don't modify form inputs
    const parent = node.parentNode;
    if (parent && parent.tagName) {
      const tag = parent.tagName.toLowerCase();
      if (tag === 'textarea' || tag === 'input' || tag === 'script' || tag === 'style' || tag === 'code' || tag === 'pre') {
        return true;
      }
    }

    return false;
  }

  function observerCallback(mutations) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (isForbiddenNode(node)) return;

        if (node.nodeType === Node.TEXT_NODE) {
          handleTextNode(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          walkTree(node);
        }
      });
    });
  }

  // Initial replacement
  walkTree(document.body);

  // Replace in title
  if (document.title) {
    document.title = replaceText(document.title);
  }

  // Observe for dynamic content
  const observer = new MutationObserver(observerCallback);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Observe title changes
  const titleElement = document.querySelector('title');
  if (titleElement) {
    const titleObserver = new MutationObserver(() => {
      document.title = replaceText(document.title);
    });
    titleObserver.observe(titleElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
})();
```

**Step 2: Verify file syntax**

Open `content_script.js` in editor and confirm no syntax errors.

**Step 3: Commit**

```bash
git add content_script.js
git commit -m "feat: rewrite content script with allowlist and configurable exclamations"
```

---

## Task 6: Create Popup HTML

**Files:**
- Modify: `popup/popup.html`

**Step 1: Replace popup.html entirely**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="popup.css">
  <title>Exclamation Propagandist</title>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <h1 class="title">!!! Exclamation !!!</h1>
      <h2 class="subtitle">Propagandist</h2>
      <p class="tagline">experience the internet more hysterically</p>
    </header>

    <!-- Master Toggle -->
    <div class="section">
      <label class="toggle-container">
        <input type="checkbox" id="enabled-toggle" class="toggle-input">
        <span class="toggle-slider"></span>
        <span class="toggle-label" id="toggle-label">ON</span>
      </label>
    </div>

    <!-- Exclamation Count -->
    <div class="section">
      <label class="setting-label">Exclamation count:</label>
      <select id="exclamation-count" class="select-input">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3" selected>3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
    </div>

    <!-- Categories -->
    <div class="section">
      <label class="setting-label">Categories:</label>
      <div class="checkbox-group">
        <label class="checkbox-container">
          <input type="checkbox" id="cat-news" class="checkbox-input">
          <span class="checkbox-heart"></span>
          <span class="checkbox-label">News</span>
        </label>
        <label class="checkbox-container">
          <input type="checkbox" id="cat-email" class="checkbox-input">
          <span class="checkbox-heart"></span>
          <span class="checkbox-label">Email</span>
        </label>
        <label class="checkbox-container">
          <input type="checkbox" id="cat-social" class="checkbox-input">
          <span class="checkbox-heart"></span>
          <span class="checkbox-label">Social Media</span>
        </label>
      </div>
    </div>

    <!-- Custom Sites -->
    <div class="section">
      <label class="setting-label">Custom sites:</label>
      <div class="custom-site-input">
        <input type="text" id="custom-site" class="text-input" placeholder="e.g. reddit.com">
        <button id="add-site" class="add-button">Add</button>
      </div>
      <div id="custom-sites-list" class="custom-sites-list">
        <!-- Sites added dynamically -->
      </div>
    </div>

    <!-- Sparkle Footer -->
    <div class="sparkle-divider">&#10023;&#65381;&#xff9f;: *&#10023;&#65381;&#xff9f;:*</div>
  </div>

  <script src="../storage.js"></script>
  <script src="popup.js"></script>
</body>
</html>
```

**Step 2: Verify HTML structure**

Open in browser to confirm structure loads.

**Step 3: Commit**

```bash
git add popup/popup.html
git commit -m "feat: create new popup HTML structure with settings UI"
```

---

## Task 7: Create Popup CSS

**Files:**
- Modify: `popup/popup.css`

**Step 1: Replace popup.css entirely**

```css
/* Exclamation Propagandist - Soft/Cute Aesthetic */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%);
  color: #5d4e6d;
  min-width: 280px;
  padding: 16px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.header {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px dashed #f8bbd9;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #e91e8c;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #ab47bc;
  margin-top: 2px;
}

.tagline {
  font-size: 12px;
  font-style: italic;
  color: #8e6b99;
  margin-top: 8px;
}

/* Sections */
.section {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(233, 30, 140, 0.1);
}

/* Toggle Switch */
.toggle-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  width: 60px;
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  position: relative;
  transition: background 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(135deg, #f48fb1 0%, #ce93d8 100%);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(30px);
}

.toggle-label {
  font-size: 16px;
  font-weight: 700;
  color: #ab47bc;
  min-width: 35px;
}

/* Settings Labels */
.setting-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #7b5e7b;
  margin-bottom: 8px;
}

/* Select Dropdown */
.select-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid #f8bbd9;
  border-radius: 8px;
  background: white;
  color: #5d4e6d;
  cursor: pointer;
  outline: none;
}

.select-input:focus {
  border-color: #e91e8c;
}

/* Checkbox Group */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  display: none;
}

.checkbox-heart {
  width: 20px;
  height: 20px;
  border: 2px solid #f8bbd9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-heart {
  background: linear-gradient(135deg, #f48fb1 0%, #ce93d8 100%);
  border-color: #e91e8c;
}

.checkbox-input:checked + .checkbox-heart::before {
  content: '\2665';
  color: white;
}

.checkbox-label {
  font-size: 14px;
  color: #5d4e6d;
}

/* Custom Site Input */
.custom-site-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.text-input {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  border: 2px solid #f8bbd9;
  border-radius: 8px;
  outline: none;
}

.text-input:focus {
  border-color: #e91e8c;
}

.text-input::placeholder {
  color: #c9a9c9;
}

.add-button {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #f48fb1 0%, #ce93d8 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.add-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(233, 30, 140, 0.3);
}

.add-button:active {
  transform: translateY(0);
}

/* Custom Sites List */
.custom-sites-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.custom-site-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(248, 187, 217, 0.3);
  border-radius: 6px;
  font-size: 13px;
}

.remove-site {
  background: none;
  border: none;
  color: #e91e8c;
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.remove-site:hover {
  color: #c2185b;
}

/* Sparkle Divider */
.sparkle-divider {
  text-align: center;
  font-size: 12px;
  color: #ce93d8;
  letter-spacing: 2px;
}
```

**Step 2: Verify CSS syntax**

Open in editor to confirm no syntax errors.

**Step 3: Commit**

```bash
git add popup/popup.css
git commit -m "feat: add soft/cute popup styling with pastel theme"
```

---

## Task 8: Create Popup JavaScript

**Files:**
- Create: `popup/popup.js`

**Step 1: Create popup.js**

```javascript
// Exclamation Propagandist - Popup UI Logic

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const enabledToggle = document.getElementById('enabled-toggle');
  const toggleLabel = document.getElementById('toggle-label');
  const exclamationCount = document.getElementById('exclamation-count');
  const catNews = document.getElementById('cat-news');
  const catEmail = document.getElementById('cat-email');
  const catSocial = document.getElementById('cat-social');
  const customSiteInput = document.getElementById('custom-site');
  const addSiteButton = document.getElementById('add-site');
  const customSitesList = document.getElementById('custom-sites-list');

  // Load current settings
  const settings = await getSettings();

  // Populate UI with current settings
  enabledToggle.checked = settings.enabled;
  updateToggleLabel(settings.enabled);
  exclamationCount.value = settings.exclamationCount;
  catNews.checked = settings.categories.news;
  catEmail.checked = settings.categories.email;
  catSocial.checked = settings.categories.social;
  renderCustomSites(settings.customSites);

  // Toggle label helper
  function updateToggleLabel(enabled) {
    toggleLabel.textContent = enabled ? 'ON' : 'OFF';
  }

  // Render custom sites list
  function renderCustomSites(sites) {
    customSitesList.innerHTML = '';
    sites.forEach((site) => {
      const tag = document.createElement('div');
      tag.className = 'custom-site-tag';
      tag.innerHTML = `
        <span>${site}</span>
        <button class="remove-site" data-site="${site}">&times;</button>
      `;
      customSitesList.appendChild(tag);
    });
  }

  // Save settings helper
  async function save() {
    const newSettings = {
      enabled: enabledToggle.checked,
      exclamationCount: parseInt(exclamationCount.value, 10),
      categories: {
        news: catNews.checked,
        email: catEmail.checked,
        social: catSocial.checked
      },
      customSites: settings.customSites
    };
    await saveSettings(newSettings);
    Object.assign(settings, newSettings);
  }

  // Event listeners
  enabledToggle.addEventListener('change', () => {
    updateToggleLabel(enabledToggle.checked);
    save();
  });

  exclamationCount.addEventListener('change', save);
  catNews.addEventListener('change', save);
  catEmail.addEventListener('change', save);
  catSocial.addEventListener('change', save);

  // Add custom site
  async function addCustomSite() {
    const site = normalizeSite(customSiteInput.value);
    if (site && !settings.customSites.includes(site)) {
      settings.customSites.push(site);
      await saveSettings({ customSites: settings.customSites });
      renderCustomSites(settings.customSites);
      customSiteInput.value = '';
    }
  }

  addSiteButton.addEventListener('click', addCustomSite);
  customSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCustomSite();
    }
  });

  // Remove custom site (event delegation)
  customSitesList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('remove-site')) {
      const site = e.target.dataset.site;
      settings.customSites = settings.customSites.filter(s => s !== site);
      await saveSettings({ customSites: settings.customSites });
      renderCustomSites(settings.customSites);
    }
  });
});
```

**Step 2: Verify file syntax**

Open `popup/popup.js` in editor and confirm no syntax errors.

**Step 3: Commit**

```bash
git add popup/popup.js
git commit -m "feat: add popup UI logic for settings management"
```

---

## Task 9: Update README

**Files:**
- Modify: `README.md`

**Step 1: Replace README.md entirely**

```markdown
<div align="center">
  <img width="128" alt="exclamation" src="logo/exclamation-128.png">
  <h1>Exclamation Propagandist</h1>
  <h3>Experience the internet more hysterically</h3>
</div>

A Chrome extension that replaces periods with exclamation points on your favorite websites. Because everything is more exciting with exclamation points!!!

## Features

- **Configurable allowlist** - Choose which sites get the exclamation treatment
- **Pre-defined categories** - Quick toggles for News, Email, and Social Media sites
- **Custom sites** - Add any site you want
- **Adjustable intensity** - Choose 1-5 exclamation points per period
- **Smart detection** - Only replaces sentence-ending periods (preserves URLs, decimals, etc.)
- **On/off toggle** - Disable anytime without uninstalling

## Installation

### Step 1: Download the extension

**Option A: Clone with Git**
```bash
git clone https://github.com/yourusername/exclamation_extension.git
```

**Option B: Download ZIP**
1. Click the green "Code" button above
2. Select "Download ZIP"
3. Extract the ZIP file to a folder on your computer

### Step 2: Open Chrome Extensions page

1. Open Chrome browser
2. Type `chrome://extensions` in the address bar
3. Press Enter

### Step 3: Enable Developer Mode

1. Look for the "Developer mode" toggle in the top-right corner
2. Click it to turn it ON (toggle should be blue)

### Step 4: Load the extension

1. Click the "Load unpacked" button (top-left area)
2. Navigate to the folder containing the extension files
3. Select the folder and click "Open"

### Step 5: Verify installation

1. You should see "Exclamation Propagandist" in your extensions list
2. Click the puzzle piece icon in Chrome's toolbar
3. Pin the extension for easy access (click the pin icon)

## Usage

1. **Click the extension icon** in your toolbar to open settings
2. **Toggle ON/OFF** - Master switch to enable/disable the extension
3. **Set exclamation count** - Choose how many !!! you want (1-5)
4. **Enable categories** - Toggle News, Email, and/or Social Media
5. **Add custom sites** - Type a domain and click Add (e.g., `reddit.com`)
6. **Refresh the page** - Changes apply to newly loaded pages

### Pre-defined Sites

**News:** CNN, BBC, NY Times, The Guardian, Washington Post, Reuters, AP News, NPR

**Email:** Gmail, Outlook, Yahoo Mail, ProtonMail

**Social Media:** Twitter/X, Facebook, Instagram, LinkedIn, Threads, Bluesky, Mastodon

## Development

Built with:
- Chrome Extension Manifest V3
- Vanilla JavaScript
- CSS3 with pastel aesthetic

### File Structure

```
exclamation_extension/
├── manifest.json      # Extension configuration
├── background.js      # Service worker
├── content_script.js  # Text replacement logic
├── storage.js         # Storage utilities
├── sites.js           # Pre-defined site categories
├── popup/
│   ├── popup.html     # Settings UI
│   ├── popup.css      # Styling
│   └── popup.js       # UI logic
└── logo/              # Extension icons
```

## License

MIT License - See [LICENSE](LICENSE) for details.

---

Made with ♡ and way too many exclamation points!!!
```

**Step 2: Verify markdown renders correctly**

Preview README.md to ensure formatting looks good.

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README with installation guide and usage instructions"
```

---

## Task 10: Test the Extension

**Step 1: Load extension in Chrome**

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `exclamation_extension` folder

**Step 2: Verify popup loads**

1. Click extension icon in toolbar
2. Confirm UI renders with all elements
3. Toggle settings and verify they persist (close and reopen popup)

**Step 3: Test on an allowed site**

1. Enable "News" category in popup
2. Navigate to `cnn.com`
3. Verify periods are replaced with exclamation points

**Step 4: Test on a non-allowed site**

1. Navigate to `github.com` (not in any category)
2. Verify periods are NOT replaced

**Step 5: Test custom sites**

1. Add `reddit.com` to custom sites
2. Navigate to `reddit.com`
3. Verify periods are replaced

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: complete extension overhaul v1.0.0"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Create sites.js with pre-defined categories |
| 2 | Create storage.js with defaults and helpers |
| 3 | Update manifest.json with permissions |
| 4 | Create background.js service worker |
| 5 | Rewrite content_script.js with allowlist logic |
| 6 | Create new popup HTML structure |
| 7 | Create soft/cute popup CSS |
| 8 | Create popup.js for UI interactivity |
| 9 | Update README with installation guide |
| 10 | Test the complete extension |
