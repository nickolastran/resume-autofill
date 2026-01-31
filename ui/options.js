/* ... Keep existing PROFILE_FIELDS and DEFAULT_DATA at the top ... */

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const jsonEditor = document.getElementById("jsonEditor");
  const msgDiv = document.getElementById("msg");
  const themeToggle = document.getElementById("themeToggle");

  // Load Data AND Theme
  chrome.storage.sync.get(["resumeData", "settings"], (result) => {
    // 1. Data Loading (Existing logic)
    const data = result.resumeData || DEFAULT_DATA;
    PROFILE_FIELDS.forEach((field) => {
      const el = document.getElementById(field);
      if (el) el.value = data.profile[field] || "";
    });
    const complexData = {
      education: data.education || [],
      work: data.work || [],
      skills: data.skills || [],
    };
    jsonEditor.value = JSON.stringify(complexData, null, 2);

    // 2. Theme Loading (New logic)
    const settings = result.settings || { theme: "light" };
    if (settings.theme === "dark") {
      document.body.setAttribute("data-theme", "dark");
    }
  });

  // Theme Toggle
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";

    document.body.setAttribute("data-theme", newTheme);

    chrome.storage.sync.get(["settings"], (result) => {
      const newSettings = { ...result.settings, theme: newTheme };
      chrome.storage.sync.set({ settings: newSettings });
    });
  });

  // Save Data (Existing Logic)
  saveBtn.addEventListener("click", () => {
    try {
      const profileData = {};
      PROFILE_FIELDS.forEach((field) => {
        const el = document.getElementById(field);
        if (el) profileData[field] = el.value.trim();
      });

      const complexData = JSON.parse(jsonEditor.value);
      const finalData = {
        profile: profileData,
        education: complexData.education,
        work: complexData.work,
        skills: complexData.skills,
      };

      chrome.storage.sync.set({ resumeData: finalData }, () => {
        showMessage("Changes saved successfully", "success");
      });
    } catch (e) {
      showMessage("Error: Invalid JSON format", "error");
    }
  });

  function showMessage(text, type) {
    msgDiv.innerText = text;
    msgDiv.className = `toast ${type}`;
    setTimeout(() => {
      msgDiv.className = "toast";
    }, 3000);
  }
});
