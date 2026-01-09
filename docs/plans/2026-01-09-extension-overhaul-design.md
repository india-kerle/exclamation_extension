# Exclamation Extension Overhaul - Design Document

## Overview

Complete overhaul of the "Periods to Exclamations" Chrome extension. Transform from a simple always-on text replacer into a configurable, user-friendly extension with allowlist-based site targeting and customizable settings.

**Tagline:** "Experience the internet more hysterically"

## Architecture

### File Structure

```
exclamation_extension/
├── manifest.json          # Extension config (updated)
├── content_script.js      # Text replacement logic (rewritten)
├── background.js          # NEW: Service worker for state management
├── popup/
│   ├── popup.html         # Interactive UI (rewritten)
│   ├── popup.css          # Playful styling (rewritten)
│   └── popup.js           # NEW: UI logic
├── storage.js             # NEW: Shared storage utilities
├── sites.js               # NEW: Pre-defined site categories
├── logo/                  # Existing icons (keep)
├── docs/
│   └── plans/             # Design documents
└── README.md              # Updated installation guide
```

### Data Model

Settings stored in `chrome.storage.sync`:

```javascript
{
  enabled: true,              // Master on/off toggle
  exclamationCount: 3,        // Number of !'s (1-5)
  categories: {
    news: false,              // Default OFF
    email: false,
    social: false
  },
  customSites: []             // User-added domains
}
```

### Component Responsibilities

**background.js (Service Worker):**
- Initialize default settings on extension install
- Handle any cross-tab coordination if needed

**content_script.js:**
- Check if extension is enabled
- Check if current site is in allowlist
- If both true: walk DOM, replace periods, observe mutations
- If either false: exit silently

**popup.js:**
- Read/write settings to chrome.storage.sync
- Update UI to reflect current state
- Handle user interactions (toggles, inputs)

**storage.js:**
- Shared utilities for reading/writing settings
- Default values
- Validation helpers

**sites.js:**
- Pre-defined site lists for each category

## Pre-defined Site Categories

### News
- cnn.com
- bbc.com, bbc.co.uk
- nytimes.com
- theguardian.com
- washingtonpost.com
- reuters.com
- apnews.com
- npr.org

### Email
- mail.google.com
- outlook.live.com, outlook.office.com
- mail.yahoo.com
- proton.me, protonmail.com

### Social Media
- twitter.com, x.com
- facebook.com
- instagram.com
- linkedin.com
- threads.net
- bsky.app
- mastodon.social

## Text Replacement Logic

### Regex Pattern

```javascript
/\.(?=\s|$|["'"'\)])/g
```

Matches periods followed by:
- Whitespace (space, newline, tab)
- End of string
- Closing quotes or parentheses

### What Gets Protected (Automatically)
- Decimals: `3.14`
- URLs: `google.com`
- File extensions: `report.pdf`

### Acceptable Collateral Damage
- Abbreviations like `Dr.`, `Mr.`, `etc.` followed by space will be replaced
- This is intentional - chaos is the point

### Replacement Flow

1. Content script loads
2. Check `storage.sync`: Is `enabled` true?
3. Check: Is current hostname in enabled category OR customSites?
4. If yes to both:
   - Walk DOM using TreeWalker
   - Replace matching periods with configured number of `!`
   - Set up MutationObserver for dynamic content
5. If no: Exit silently, no performance impact

## Popup UI Design

### Layout

```
┌─────────────────────────────────┐
│      !!! Exclamation !!!        │  Header (playful font)
│         Propagandist            │
│  experience the internet more   │  Tagline (italic)
│         hysterically            │
├─────────────────────────────────┤
│      [====== ON ======]         │  Master toggle
├─────────────────────────────────┤
│  Exclamation count:  [3] ▼      │  Dropdown 1-5
├─────────────────────────────────┤
│  Categories:                    │
│  ♡ News                         │  Heart checkboxes
│  ♡ Email                        │
│  ♡ Social Media                 │
├─────────────────────────────────┤
│  Custom sites:                  │
│  ┌─────────────────────┐ [Add]  │
│  │ e.g. reddit.com     │        │
│  └─────────────────────┘        │
│  ✕ reddit.com                   │  Removable tags
│  ✕ slack.com                    │
└─────────────────────────────────┘
```

### Styling

**Aesthetic:** Soft/cute - pastel pinks, lavenders, rounded corners, hearts, subtle sparkles

**Colors:**
- Background: Soft pastel pink or lavender
- Accents: Deeper pink/magenta for interactive elements
- Text: Dark gray for readability

**Elements:**
- Rounded corners on all elements
- Heart-shaped checkbox indicators
- Chunky toggle switch (not boring checkbox)
- Subtle sparkle decorations as accents
- Soft drop shadows for depth

**Size:** ~280px wide, height adjusts based on custom sites list

## Behaviors

### On First Install
- Extension enabled: ON
- Exclamation count: 3
- All categories: OFF
- Custom sites: empty

User must actively enable categories - no surprise chaos.

### Toggle Off Behavior
- Stops future replacements on all tabs
- Already-modified text remains (refresh to restore)
- Simple, predictable, standard behavior

### Storage
- Uses `chrome.storage.sync` - settings follow user across devices
- Falls back gracefully if unavailable

### Validation
- Custom site URLs: strip `https://`, `http://`, `www.`, trailing slashes
- Store as bare domain: `reddit.com`

## README Structure

1. **Header** - Logo and extension name
2. **Tagline** - "Experience the internet more hysterically"
3. **Features** - Bullet list of capabilities
4. **Installation** - Step-by-step with clear instructions
5. **Usage** - How to configure the extension
6. **Development** - Notes for future modifications

## Summary of Decisions

| Aspect | Decision |
|--------|----------|
| Site targeting | Allowlist with 3 categories + custom URLs |
| Pre-defined categories | News, Email, Social Media |
| Exclamation count | Global setting, 1-5 |
| Toggle behavior | Stops future replacements only |
| Period detection | Sentence-ending periods only |
| Abbreviations | Acceptable collateral damage |
| UI aesthetic | Soft/cute, pastels, hearts, sparkles |
| Default state | Extension ON, all categories OFF |
| Storage | chrome.storage.sync |
