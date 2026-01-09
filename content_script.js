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

  // Blacklist of abbreviations that shouldn't be converted
  // These are common periods that don't end sentences
  const abbreviationBlacklist = [
    // Titles
    'Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Sr', 'Jr', 'Rev', 'Fr', 'St',
    // Common abbreviations
    'etc', 'e\\.g', 'i\\.e', 'vs', 'viz', 'al', 'approx', 'apt', 'dept',
    'est', 'min', 'max', 'misc', 'no', 'vol', 'pg', 'pp', 'fig',
    // Addresses
    'Ave', 'Blvd', 'Rd', 'St', 'Ln', 'Dr', 'Ct', 'Pl',
    // Months
    'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Sept', 'Oct', 'Nov', 'Dec',
    // Time
    'a\\.m', 'p\\.m', 'A\\.M', 'P\\.M',
    // Academic
    'Ph\\.D', 'M\\.D', 'B\\.A', 'M\\.A', 'B\\.S', 'M\\.S',
    // Other
    'Inc', 'Ltd', 'Corp', 'Co', 'Mt', 'Ft'
  ];

  // Build regex pattern for abbreviations (case insensitive)
  const abbrPattern = abbreviationBlacklist.join('|');

  // Regex for numbered lists (e.g., "1." "2." "10.")
  const numberedListRegex = /(\d+)\.(?=\s)/g;

  // Regex for abbreviations followed by period
  const abbrRegex = new RegExp(`((?:${abbrPattern}))\\.`, 'gi');

  // Placeholder to protect abbreviations and numbered lists
  const ABBR_PLACEHOLDER = '\u0000ABBR\u0000';
  const NUM_PLACEHOLDER = '\u0000NUM\u0000';

  // Regex for sentence-ending periods
  // Matches period followed by: whitespace, end of string, or closing punctuation
  const periodRegex = /\.(?=\s|$|["'"'\)\]])/g;

  function replaceText(text) {
    // Store abbreviations and numbered lists
    const abbrMatches = [];
    const numMatches = [];

    // Protect abbreviations
    let processed = text.replace(abbrRegex, (match) => {
      abbrMatches.push(match);
      return ABBR_PLACEHOLDER;
    });

    // Protect numbered lists
    processed = processed.replace(numberedListRegex, (match) => {
      numMatches.push(match);
      return NUM_PLACEHOLDER;
    });

    // Replace remaining periods with exclamations
    processed = processed.replace(periodRegex, exclamations);

    // Restore abbreviations
    abbrMatches.forEach((abbr) => {
      processed = processed.replace(ABBR_PLACEHOLDER, abbr);
    });

    // Restore numbered lists
    numMatches.forEach((num) => {
      processed = processed.replace(NUM_PLACEHOLDER, num);
    });

    return processed;
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
