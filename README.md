# 📺 Subtitles Browser Extension

## 🌟 Overview

This browser extension lets you add interactive subtitles to videos, helping you learn Japanese while enjoying your favorite shows. Built with React and JavaScript, it overlays custom subtitles and provides definitions on hover for an immersive learning experience.

## 🚀 Key Features

- **Subtitle Overlay**: Displays subtitles from uploaded VTT (WebVTT) files on top of any video.
- **Interactive Learning**: Hover over words for definitions, JLPT levels, and more.
- **Vocabulary Tracking**: Manage and track your learned vocabulary.
- **Multi-Platform Support**: Works with popular video platforms. (Supports: AmazonPrime, Youtube)

## 🎬 Demo

### See It In Action

![Screenshot of the extension](./screenshots/Screenshot%202024-10-26%20185301.png)

Learn Japanese in real-time with interactive subtitles and popovers for definitions.

### Take Quizzes

![Screenshot of the quiz feature](./screenshots/Screenshot%202024-10-26%20184203.png)

Reinforce your knowledge with vocabulary quizzes to test your skills.

### Vocabulary Management

![Screenshot of vocabulary manager](./screenshots/Screenshot%202024-10-27%20120828.png)

Track what you've learned with a built-in vocabulary manager.

## 🛠 Components

- **SubtitlesContainer**: Renders the subtitle overlay and manages user actions.
- **SubtitleOverlay**: Displays subtitle text with custom styling.
- **WordPopover**: Shows additional word details on hover.

## 🔧 Functions

- **parseVTT**: Parses VTT files for subtitle content.
- **loadSubtitles**: Loads subtitles from local storage.
- **handleFileChange**: Updates local storage with user-uploaded subtitles.
- **toggleOverlay**: Shows or hides the subtitle overlay.

## 🎨 Styling

Styled with CSS and Tailwind CSS for a sleek, modern UI.

## 📥 Installation

1. **Clone** the repository: `git clone [repository URL]`
2. **Install dependencies**: `npm install`
3. **Build the project**: `npm run build`
4. **Load as an extension**:
   - Go to `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked" and select the project folder.

## ▶️ Usage

1. Play a video in your browser.
2. Toggle subtitles by clicking the extension icon.

## 🤝 Contributing

Found a bug or have a feature request? Open an issue and let us know!
