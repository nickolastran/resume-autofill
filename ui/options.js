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

const DEFAULT_DATA = {
  profile: {},
  education: [],
  work: [],
  skills: [],
};

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const msgDiv = document.getElementById("msg");
  const themeToggle = document.getElementById("themeToggle");

  // Section Containers
  const educationList = document.getElementById("educationList");
  const workList = document.getElementById("workList");
  const skillsInput = document.getElementById("skillsInput");

  // Add Buttons
  const addEduBtn = document.getElementById("addEducationBtn");
  const addWorkBtn = document.getElementById("addWorkBtn");

  // --- 1. Load Data ---
  chrome.storage.sync.get(["resumeData", "settings"], (result) => {
    const data = result.resumeData || DEFAULT_DATA;
    const settings = result.settings || { theme: "light" };

    // A. Load Profile Inputs
    PROFILE_FIELDS.forEach((field) => {
      const el = document.getElementById(field);
      if (el) el.value = data.profile[field] || "";
    });

    // B. Load Education List
    (data.education || []).forEach((edu) => createEducationRow(edu));

    // C. Load Work List
    (data.work || []).forEach((job) => createWorkRow(job));

    // D. Load Skills (Convert Array -> Comma String)
    if (Array.isArray(data.skills)) {
      skillsInput.value = data.skills.join(", ");
    }

    // E. Load Theme
    if (settings.theme === "dark") {
      document.body.setAttribute("data-theme", "dark");
    }
  });

  // --- 2. Dynamic Row Logic ---

  // Helper: Create Education Row
  function createEducationRow(data = {}) {
    const template = document.getElementById("eduTemplate");
    const clone = template.content.cloneNode(true);

    // Fill values if they exist
    clone.querySelector(".edu-school").value = data.school || "";
    clone.querySelector(".edu-degree").value = data.degree || "";
    clone.querySelector(".edu-gpa").value = data.gpa || "";
    clone.querySelector(".edu-start").value = data.startDate || "";
    clone.querySelector(".edu-end").value = data.endDate || "";

    // Add Delete Listener
    clone.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.target.closest(".list-item").remove();
    });

    educationList.appendChild(clone);
  }

  // Helper: Create Work Row
  function createWorkRow(data = {}) {
    const template = document.getElementById("workTemplate");
    const clone = template.content.cloneNode(true);

    // Fill values
    clone.querySelector(".work-company").value = data.company || "";
    clone.querySelector(".work-title").value = data.title || "";
    clone.querySelector(".work-location").value = data.location || "";
    clone.querySelector(".work-start").value = data.startDate || "";
    clone.querySelector(".work-end").value = data.endDate || "";
    clone.querySelector(".work-desc").value = data.description || "";

    // Add Delete Listener
    clone.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.target.closest(".list-item").remove();
    });

    workList.appendChild(clone);
  }

  // Event Listeners for Add Buttons
  addEduBtn.addEventListener("click", () => createEducationRow());
  addWorkBtn.addEventListener("click", () => createWorkRow());

  // --- 3. Save Logic ---
  saveBtn.addEventListener("click", () => {
    try {
      // A. Harvest Profile
      const profileData = {};
      PROFILE_FIELDS.forEach((field) => {
        const el = document.getElementById(field);
        if (el) profileData[field] = el.value.trim();
      });

      // B. Harvest Education
      const educationData = [];
      document.querySelectorAll("#educationList .list-item").forEach((item) => {
        educationData.push({
          school: item.querySelector(".edu-school").value.trim(),
          degree: item.querySelector(".edu-degree").value.trim(),
          gpa: item.querySelector(".edu-gpa").value.trim(),
          startDate: item.querySelector(".edu-start").value.trim(),
          endDate: item.querySelector(".edu-end").value.trim(),
        });
      });

      // C. Harvest Work
      const workData = [];
      document.querySelectorAll("#workList .list-item").forEach((item) => {
        workData.push({
          company: item.querySelector(".work-company").value.trim(),
          title: item.querySelector(".work-title").value.trim(),
          location: item.querySelector(".work-location").value.trim(),
          startDate: item.querySelector(".work-start").value.trim(),
          endDate: item.querySelector(".work-end").value.trim(),
          description: item.querySelector(".work-desc").value.trim(),
        });
      });

      // D. Harvest Skills (String -> Array)
      const skillsData = skillsInput.value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Construct Final Object
      const finalData = {
        profile: profileData,
        education: educationData,
        work: workData,
        skills: skillsData,
      };

      // Save
      chrome.storage.sync.set({ resumeData: finalData }, () => {
        showMessage("Saved successfully!", "success");
      });
    } catch (e) {
      console.error(e);
      showMessage("Error saving data.", "error");
    }
  });

  // --- Theme Toggle ---
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    document.body.setAttribute("data-theme", newTheme);

    chrome.storage.sync.get(["settings"], (result) => {
      const newSettings = { ...result.settings, theme: newTheme };
      chrome.storage.sync.set({ settings: newSettings });
    });
  });

  function showMessage(text, type) {
    msgDiv.innerText = text;
    msgDiv.className = `toast ${type}`;
    msgDiv.style.display = "block";
    setTimeout(() => {
      msgDiv.style.display = "none";
      msgDiv.className = "toast";
    }, 3000);
  }
});
