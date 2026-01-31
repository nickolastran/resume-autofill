/**
 * observer.js
 * Watches for DOM changes to handle dynamic forms.
 */

const DomObserver = (() => {
  let observer = null;
  let debounceTimer = null;

  function start(callback) {
    if (observer) return; // Already running

    observer = new MutationObserver((mutations) => {
      // Simple debounce to prevent performance hits
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Only trigger if inputs were added
        const hasInputs = mutations.some((m) =>
          Array.from(m.addedNodes).some(
            (n) =>
              n.nodeName === "INPUT" ||
              n.nodeName === "TEXTAREA" ||
              n.nodeName === "SELECT" ||
              (n.querySelector && n.querySelector("input, textarea, select")),
          ),
        );

        if (hasInputs) {
          callback();
        }
      }, 500); // 500ms debounce
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function stop() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  return {
    start,
    stop,
  };
})();
