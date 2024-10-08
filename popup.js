document.addEventListener('DOMContentLoaded', function() {
  const toggles = ['mainContent', 'recommendations'];
  const toggleExtensionButton = document.getElementById('toggleExtension');

  // Load saved settings
  chrome.storage.sync.get(['hiddenSections', 'extensionEnabled'], function(result) {
    const hiddenSections = result.hiddenSections || {};
    const extensionEnabled = result.extensionEnabled !== false;

    toggles.forEach(toggle => {
      document.getElementById(toggle).checked = hiddenSections[toggle] || false;
    });

    updateToggleExtensionButton(extensionEnabled);
  });

  // Add event listeners to toggles
  toggles.forEach(toggle => {
    document.getElementById(toggle).addEventListener('change', function() {
      updateSettings();
    });
  });

  // Add event listener to global toggle button
  toggleExtensionButton.addEventListener('click', function() {
    chrome.storage.sync.get(['extensionEnabled'], function(result) {
      const newState = !(result.extensionEnabled !== false);
      chrome.storage.sync.set({extensionEnabled: newState}, function() {
        updateToggleExtensionButton(newState);
        updateSettings();
      });
    });
  });

  function updateSettings() {
    const hiddenSections = {};
    toggles.forEach(toggle => {
      hiddenSections[toggle] = document.getElementById(toggle).checked;
    });

    // Save settings
    chrome.storage.sync.set({hiddenSections: hiddenSections}, function() {
      // Notify content script to update sections
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'updateSections'});
      });
    });
  }

  function updateToggleExtensionButton(enabled) {
    toggleExtensionButton.textContent = enabled ? 'Turn Extension Off' : 'Turn Extension On';
    toggleExtensionButton.style.backgroundColor = enabled ? '#cc0000' : '#28a745';
  }
});