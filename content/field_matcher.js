/**
 * field_matcher.js
 * Handles logic for identifying fields and calculating confidence scores.
 */

const FieldMatcher = (() => {
  // Synonyms mapping for Resume Data Keys
  const SYNONYMS = {
    firstName: ["first name", "given name", "forename", "fname"],
    lastName: ["last name", "surname", "family name", "lname"],
    fullName: ["full name", "complete name", "your name"],
    email: ["email", "e-mail", "mail address"],
    phone: ["phone", "mobile", "cell", "telephone", "contact number"],
    addressLine1: ["address", "street", "address line 1", "residence"],
    city: ["city", "town", "municipality"],
    state: ["state", "province", "region", "territory"],
    zip: ["zip", "postal", "zipcode", "postcode"],
    country: ["country", "nation"],
    linkedin: ["linkedin", "linked in", "linkedin profile"],
    github: ["github", "git hub", "github profile"],
    portfolio: ["portfolio", "website", "personal site", "url"],
    // Simplified handling for arrays (Education/Work) requires complex UI matching
    // For this implementation, we focus on scalar profile fields + general skills
  };

  const NEGATIVE_TERMS = {
    fullName: ["company", "referral", "parent", "supervisor"],
    phone: ["fax", "company"],
    email: ["confirm", "alternate"],
  };

  /**
   * Normalizes string for comparison: lowercase, remove punctuation.
   */
  function normalize(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  /**
   * checks if a string contains any of the terms
   */
  function containsAny(text, terms) {
    const nText = normalize(text);
    return terms.some((term) => nText.includes(normalize(term)));
  }

  /**
   * Calculates confidence score (0.0 to 1.0)
   */
  function getConfidence(element, fieldKey) {
    let score = 0.0;
    const terms = SYNONYMS[fieldKey];
    if (!terms) return 0;

    // Attributes to check
    const id = normalize(element.id || "");
    const name = normalize(element.name || "");
    const placeholder = normalize(element.placeholder || "");
    const ariaLabel = normalize(element.getAttribute("aria-label") || "");

    // Find associated label
    let labelText = "";
    if (element.id) {
      const labelEl = document.querySelector(`label[for="${element.id}"]`);
      if (labelEl) labelText = normalize(labelEl.innerText);
    }
    // Fallback: Check parent label
    if (!labelText) {
      const parentLabel = element.closest("label");
      if (parentLabel) labelText = normalize(parentLabel.innerText);
    }

    // SCORING LOGIC
    // 1. Label Match (Highest Weight)
    if (containsAny(labelText, terms)) score += 0.5;

    // 2. Aria Label Match
    if (containsAny(ariaLabel, terms)) score += 0.4;

    // 3. Placeholder Match
    if (containsAny(placeholder, terms)) score += 0.3;

    // 4. Name/ID Match
    if (containsAny(name, terms)) score += 0.2;
    if (containsAny(id, terms)) score += 0.2;

    // NEGATIVE SCORING (Ambiguity check)
    const negatives = NEGATIVE_TERMS[fieldKey];
    if (negatives) {
      const combinedContext = id + name + labelText + placeholder;
      if (containsAny(combinedContext, negatives)) {
        score -= 0.5;
      }
    }

    // Safety: Cap at 1.0
    return Math.min(Math.max(score, 0), 1.0);
  }

  return {
    getConfidence,
  };
})();
