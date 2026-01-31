/**
 * filler.js
 * Handles value injection and event dispatching.
 */

const Filler = (() => {
  /**
   * Sets value on input using native setter to bypass React/Angular overrides.
   */
  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, "value").set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
      prototype,
      "value",
    ).set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      valueSetter.call(element, value);
    }
  }

  function fillField(element, value, force = false) {
    // Safety 1: Don't fill hidden or submit fields
    if (
      element.type === "hidden" ||
      element.type === "submit" ||
      element.type === "button"
    )
      return false;

    // Safety 2: Don't overwrite existing value unless forced
    if (element.value && element.value.trim() !== "" && !force) return false;

    // Set Value safely
    try {
      element.value = value;
      setNativeValue(element, value);
    } catch (e) {
      element.value = value; // Fallback
    }

    // Dispatch Events to trigger framework change detection
    const events = ["input", "change", "blur", "focus"];
    events.forEach((eventType) => {
      const event = new Event(eventType, { bubbles: true, cancelable: true });
      element.dispatchEvent(event);
    });

    return true;
  }

  return {
    fillField,
  };
})();
