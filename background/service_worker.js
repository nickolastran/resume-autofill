chrome.runtime.onInstalled.addListener(() => {
  console.log("Resume Autofill Pro installed.");
  // Initialize default storage if empty
  chrome.storage.sync.get(["resumeData", "settings"], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({
        settings: {
          autofillEnabled: true,
          debugMode: false,
        },
      });
    }
  });
});
