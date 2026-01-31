document.addEventListener("DOMContentLoaded", () => {
  const btnFill = document.getElementById("btnFill");
  const btnOptions = document.getElementById("btnOptions");
  const toggleAutofill = document.getElementById("toggleAutofill");
  const statusMsg = document.getElementById("statusMsg");

  // Load Settings
  chrome.storage.sync.get(["settings"], (result) => {
    if (result.settings) {
      toggleAutofill.checked = result.settings.autofillEnabled;
    }
  });

  // Event: Fill Now
  btnFill.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "FILL_NOW" },
        (response) => {
          if (chrome.runtime.lastError) {
            statusMsg.innerText = "Error: Refresh page.";
          } else {
            statusMsg.innerText = "Fill Command Sent!";
            setTimeout(() => (statusMsg.innerText = "Extension Ready"), 2000);
          }
        },
      );
    });
  });

  // Event: Toggle Autofill
  toggleAutofill.addEventListener("change", (e) => {
    chrome.storage.sync.get(["settings"], (result) => {
      const newSettings = {
        ...result.settings,
        autofillEnabled: e.target.checked,
      };
      chrome.storage.sync.set({ settings: newSettings });
    });
  });

  // Event: Open Options
  btnOptions.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("ui/options.html"));
    }
  });
});
