# AVA AIDER - YouTube Summarization & Translation Chrome Extension

### **Table of Contents**
1. [Overview](#overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [How It Works](#how-it-works)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)
9. [Acknowledgments](#acknowledgments)

---

## **Overview**

**AVA AIDER** is a Chrome extension designed to enhance the learning experience for users watching educational content on YouTube. The plugin integrates seamlessly with YouTube's native interface, allowing users to generate summaries of video transcripts and translate them into different languages.

This tool addresses a common challenge faced by learners: extracting concise, multilingual summaries from educational content, without relying on external tools or manually creating notes.

---

## **Features**

- **Summarization Options**:
    - Generate `TL;DR` summaries or `Key Points` summaries of YouTube transcripts.
    - Adjust summary length to suit your needs.

- **Multilingual Support**:
    - Translate summaries into any supported language using Google Translation API.

- **YouTube Integration**:
    - Injects seamlessly into the YouTube interface for a native-like user experience.

---

## **Technologies Used**

- **Frontend**: Chrome Extension (JavaScript, HTML, CSS)
- **APIs**:
    - **Summarization API**: Extracts concise summaries from YouTube subtitles.
    - **Translation API**: Translates the summaries into the selected language.

- **Backend**: (Optional, if backend used) Node.js or cloud functions for API integration.

---

## **How It Works**

1. **Extract Subtitles**: The plugin fetches subtitles from the YouTube video.
2. **Summarize Content**: Users can choose the type (TL;DR or Key Points) and length of summary they want.
3. **Translate Summary**: The summary is translated into the user-selected language.
4. **Display Results**: The plugin displays the result directly in the YouTube interface for a smooth experience.

---

## **Installation**

1. run `pnmp install` and `pnpm build`
2. Open Chrome and navigate to `chrome://extensions/`. Enable **Developer Mode** by toggling the switch in the top-right corner.
3. Click on the **"Load unpacked"** button.
4. Browse and select the folder where you cloned the repository.
5. The AVA AIDER extension will now appear in your list of extensions.

---

## **Usage**

1. Open YouTube and play a video with subtitles enabled.
2. Click the **AVA AIDER** icon in your Chrome toolbar to activate the extension.
3. Configure your preferences:
    - Choose the summary type: `TL;DR` or `Key Points`.
    - Set the desired summary length.
    - Select the target language for translation.
4. View the generated summary and translation directly within the YouTube interface.

## **License**
This project is licensed under the MIT License. You are free to use, modify, and distribute this project in compliance with the license terms.


