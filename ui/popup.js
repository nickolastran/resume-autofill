document.addEventListener("DOMContentLoaded", () => {
  const btnFill = document.getElementById("btnFill");
  const btnOptions = document.getElementById("btnOptions");
  const toggleAutofill = document.getElementById("toggleAutofill");
  const statusMsg = document.getElementById("statusMsg");
  const statusDot = document.getElementById("statusDot");
  const themeToggle = document.getElementById("themeToggle");

  // Load Settings & Theme
  chrome.storage.sync.get(["settings"], (result) => {
    const settings = result.settings || {
      autofillEnabled: true,
      theme: "light",
    };

    // Set Autofill Toggle
    toggleAutofill.checked = settings.autofillEnabled;

    // Set Theme
    if (settings.theme === "dark") {
      document.body.setAttribute("data-theme", "dark");
    }
  });

  // Theme Toggle Handler
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";

    // Apply immediately
    document.body.setAttribute("data-theme", newTheme);

    // Save
    chrome.storage.sync.get(["settings"], (result) => {
      const newSettings = { ...result.settings, theme: newTheme };
      chrome.storage.sync.set({ settings: newSettings });
    });
  });

  // Autofill Toggle Handler
  toggleAutofill.addEventListener("change", (e) => {
    chrome.storage.sync.get(["settings"], (result) => {
      const newSettings = {
        ...result.settings,
        autofillEnabled: e.target.checked,
      };
      chrome.storage.sync.set({ settings: newSettings });

      statusMsg.innerText = e.target.checked
        ? "Extension Ready"
        : "Autofill Paused";
      statusDot.className = e.target.checked ? "dot ready" : "dot";
    });
  });

  // Fill Page Handler
  btnFill.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "FILL_NOW" },
        (response) => {
          if (chrome.runtime.lastError) {
            statusMsg.innerText = "Refresh Page First";
            statusDot.className = "dot error";
          } else {
            statusMsg.innerText = "Fill Command Sent!";
            statusDot.className = "dot ready";
            setTimeout(() => (statusMsg.innerText = "Extension Ready"), 2000);
          }
        },
      );
    });
  });

  // Options Page
  btnOptions.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("ui/options.html"));
    }
  });
});
