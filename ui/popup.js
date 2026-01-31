document.addEventListener("DOMContentLoaded", () => {
  const btnFill = document.getElementById("btnFill");
  const btnOptions = document.getElementById("btnOptions");
  const toggleAutofill = document.getElementById("toggleAutofill");
  const statusMsg = document.getElementById("statusMsg");
  const statusDot = document.getElementById("statusDot");
  const themeToggle = document.getElementById("themeToggle");

  // --- Helper: Update Status UI ---
  function updateStatusUI(isEnabled) {
    if (isEnabled) {
      statusMsg.innerText = "Autofill Ready";
      statusDot.className = "status-dot active";
    } else {
      statusMsg.innerText = "Autofill Paused";
      statusDot.className = "status-dot paused";
    }
  }

  // --- 1. Load Initial State ---
  chrome.storage.sync.get(["settings"], (result) => {
    const settings = result.settings || {
      autofillEnabled: true,
      theme: "light",
    };

    // Set Theme (Instant)
    if (settings.theme === "dark") {
      document.body.setAttribute("data-theme", "dark");
    }

    // Set Toggles
    toggleAutofill.checked = settings.autofillEnabled;
    updateStatusUI(settings.autofillEnabled);
  });

  // --- 2. Theme Toggle (Instant) ---
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";

    // Apply DOM change immediately
    document.body.setAttribute("data-theme", newTheme);

    // Save to storage in background
    chrome.storage.sync.get(["settings"], (result) => {
      const newSettings = { ...result.settings, theme: newTheme };
      chrome.storage.sync.set({ settings: newSettings });
    });
  });

  // --- 3. Autofill Toggle ---
  toggleAutofill.addEventListener("change", (e) => {
    const isEnabled = e.target.checked;
    updateStatusUI(isEnabled);

    chrome.storage.sync.get(["settings"], (result) => {
      const newSettings = { ...result.settings, autofillEnabled: isEnabled };
      chrome.storage.sync.set({ settings: newSettings });
    });
  });

  // --- 4. Fill Button Logic ---
  btnFill.addEventListener("click", () => {
    // Add a temporary "Pressed" state
    btnFill.innerText = "Filling...";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "FILL_NOW" },
        (response) => {
          // Handle success or failure
          if (chrome.runtime.lastError) {
            statusMsg.innerText = "Refresh Page First";
            statusDot.className = "status-dot error";
            btnFill.innerText = "Fill This Page";
          } else {
            statusMsg.innerText = "Success!";
            statusDot.className = "status-dot active";
            btnFill.innerText = "Filled!";

            // Reset button text after 2 seconds
            setTimeout(() => {
              btnFill.innerText = "Fill This Page";
              // Revert status message based on toggle
              updateStatusUI(toggleAutofill.checked);
            }, 2000);
          }
        },
      );
    });
  });

  // --- 5. Options Page ---
  btnOptions.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("ui/options.html"));
    }
  });
});
