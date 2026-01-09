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
