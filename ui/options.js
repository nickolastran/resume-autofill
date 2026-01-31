const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "fullName",
  "email",
  "phone",
  "addressLine1",
  "city",
  "state",
  "zip",
  "country",
  "linkedin",
  "github",
  "portfolio",
];

// Default Data Structure
const DEFAULT_DATA = {
  profile: {},
  education: [],
  work: [],
  skills: [],
};

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const jsonEditor = document.getElementById("jsonEditor");
  const msgDiv = document.getElementById("msg");

  // Load Data
  chrome.storage.sync.get(["resumeData"], (result) => {
    const data = result.resumeData || DEFAULT_DATA;

    // Populate Profile Inputs
    PROFILE_FIELDS.forEach((field) => {
      const el = document.getElementById(field);
      if (el) el.value = data.profile[field] || "";
    });

    // Populate JSON Editor (excluding profile to avoid duplication confusion in UI,
    // but we merge it back on save)
    const complexData = {
      education: data.education || [],
      work: data.work || [],
      skills: data.skills || [],
    };
    jsonEditor.value = JSON.stringify(complexData, null, 2);
  });

  // Save Data
  saveBtn.addEventListener("click", () => {
    try {
      // 1. Harvest Profile Fields
      const profileData = {};
      PROFILE_FIELDS.forEach((field) => {
        const el = document.getElementById(field);
        if (el) profileData[field] = el.value.trim();
      });

      // 2. Harvest JSON Editor
      const complexData = JSON.parse(jsonEditor.value);

      // 3. Construct Final Object
      const finalData = {
        profile: profileData,
        education: complexData.education,
        work: complexData.work,
        skills: complexData.skills,
      };

      // 4. Save to Storage
      chrome.storage.sync.set({ resumeData: finalData }, () => {
        showMessage("Data saved successfully!", "success");
      });
    } catch (e) {
      showMessage("Invalid JSON in the editor area.", "error");
    }
  });

  function showMessage(text, type) {
    msgDiv.innerText = text;
    msgDiv.className = `message ${type}`;
    setTimeout(() => {
      msgDiv.className = "message";
    }, 3000);
  }
});
