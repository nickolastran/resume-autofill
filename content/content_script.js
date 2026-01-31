/**
 * content/content_script.js
 * Main entry point for page interaction.
 */

let RESUME_DATA = null;
let SETTINGS = null;
const CONFIDENCE_THRESHOLD = 0.7;

// Initialize
function init() {
  chrome.storage.sync.get(["resumeData", "settings"], (result) => {
    RESUME_DATA = result.resumeData;
    SETTINGS = result.settings || { autofillEnabled: true, debugMode: false };

    if (SETTINGS.autofillEnabled) {
      // Initial scan
      scanAndAutofill(false);
      // Start observer for dynamic fields
      DomObserver.start(() => scanAndAutofill(false));
    }
  });
}

/**
 * Main logic to find inputs and fill them
 */
function scanAndAutofill(force) {
  if (!RESUME_DATA || !RESUME_DATA.profile) return;

  const inputs = document.querySelectorAll("input, textarea, select");
  let filledCount = 0;

  inputs.forEach((input) => {
    // Identify best match from profile data
    let bestMatchKey = null;
    let maxScore = 0;

    Object.keys(RESUME_DATA.profile).forEach((key) => {
      const score = FieldMatcher.getConfidence(input, key);
      if (score > maxScore) {
        maxScore = score;
        bestMatchKey = key;
      }
    });

    if (maxScore >= CONFIDENCE_THRESHOLD && bestMatchKey) {
      const value = RESUME_DATA.profile[bestMatchKey];
      if (value) {
        const success = Filler.fillField(input, value, force);
        if (success) {
          filledCount++;
          if (SETTINGS.debugMode) {
            console.log(
              `[ResumeAutofill] Filled ${bestMatchKey} (Score: ${maxScore})`,
              input,
            );
          }
          // Visual Indicator (Green Border)
          input.style.border = "2px solid #4CAF50";
        }
      }
    }
  });

  if (filledCount > 0 && SETTINGS.debugMode) {
    console.log(`[ResumeAutofill] Filled ${filledCount} fields.`);
  }
}

// Listen for messages from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FILL_NOW") {
    // Reload data just in case
    chrome.storage.sync.get(["resumeData"], (result) => {
      RESUME_DATA = result.resumeData;
      scanAndAutofill(true); // Force fill
      sendResponse({ status: "done" });
    });
  }
  return true;
});

// Start
init();
