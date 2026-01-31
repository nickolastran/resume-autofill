# Resume Autofiller

A secure, zero-dependency Chrome Extension to autofill job applications with your resume data.

## Features

- **Smart Matching**: Uses a confidence scoring system (Label, Aria, ID, Placeholder) to find fields.
- **Safe Filling**: Never overwrites existing data unless forced. Does not touch passwords.
- **React Support**: Triggers native events so React/Angular forms detect changes.
- **Dynamic**: Uses MutationObservers to handle multi-step forms.

## Installation

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked**.
5. Select the `resume-autofill` folder.

## How to Use

1. Click the extension icon and select **Open Options** (or right-click > Options).
2. Fill in your Profile details.
3. (Optional) Edit the JSON for Education/Work history.
4. Click **Save Data**.
5. Navigate to a job application (e.g., Workday, Lever).
6. The extension will attempt to autofill automatically.
7. Use the Popup menu to "Fill This Page Now" if fields were missed.

## Debugging

- Check the console (F12) for logs regarding field confidence scores.
- Green borders indicate successfully filled fields.
