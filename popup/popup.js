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
