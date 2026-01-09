
## 🌸 Exclamation Chrome Extension: Eperience the internet more hysterically

A Chrome extension that replaces periods with exclamation points on your favorite websites. Because everything is more hysterical with exclamation points!!!

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