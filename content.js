function toggleSection(sectionId, hide) {
  const section = document.querySelector(sectionId);
  if (section) {
    section.style.display = hide ? 'none' : '';
  }
}

function toggleRecommendations(hide) {
  // Hide side recommendations
  const sideRecommendations = document.querySelector('ytd-watch-next-secondary-results-renderer');
  if (sideRecommendations) {
    sideRecommendations.style.display = hide ? 'none' : '';
  }

  // Hide bottom recommendations
  const bottomRecommendations = document.querySelector('#related');
  if (bottomRecommendations) {
    bottomRecommendations.style.display = hide ? 'none' : '';
  }
}

function updateSections() {
  chrome.storage.sync.get(['hiddenSections', 'extensionEnabled'], function(result) {
    const hiddenSections = result.hiddenSections || {};
    const extensionEnabled = result.extensionEnabled !== false;

    if (extensionEnabled) {
      toggleSection('#primary', hiddenSections.mainContent);
      toggleRecommendations(hiddenSections.recommendations);
    } else {
      // Show all sections when the extension is disabled
      toggleSection('#primary', false);
      toggleRecommendations(false);
    }
  });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateSections') {
    updateSections();
  }
});

// Initial update
updateSections();

// Observe for dynamic content changes
const observer = new MutationObserver(updateSections);
observer.observe(document.body, { childList: true, subtree: true });

// Listen for URL changes
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    updateSections();
  }
}).observe(document, {subtree: true, childList: true});