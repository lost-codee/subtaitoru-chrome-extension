# Subtaitoru - Japanese Learning Chrome Extension

https://subtaitoru.site

## 🌟 Overview
Learn Japanese while watching your favorite movies, anime, or TV shows on streaming platforms. This Chrome extension enhances your viewing experience by providing interactive Japanese learning features.

## Features

### 1. Hover Translation
Instantly translate Japanese text by hovering over it. Perfect for understanding subtitles or any Japanese text on the page.

![Hover Translation](screenshots/hover-translation.png)
*(Screenshot: Hover translation in action)*

### 2. Subtitle Support
- **Multiple Platform Support**: Works with YouTube and Amazon Prime Video
- **Automatic Subtitle Detection**: Automatically detects and processes Japanese subtitles
- **Subtitle Timing Adjustment**: Fine-tune subtitle timing with offset controls
- **Experimental Features**: Amazon Prime support (in beta)

![Subtitle Support](screenshots/subtitle-support.png)
*(Screenshot: Subtitle controls and settings)*

### 3. Interactive Learning
- **Word Quiz**: Test your Japanese knowledge with quizzes generated from your watched content
- **Word Management**: Save and review words you've learned
- **Progress Tracking**: Keep track of your learning journey

![Quiz Feature](screenshots/quiz-feature.png)
*(Screenshot: Quiz interface)*

### 4. User-Friendly Interface
- **Clean, Modern Design**: Intuitive popup interface with purple theme
- **Easy Settings Management**: Quick access to all features and settings
- **Error Handling**: Comprehensive error reporting with user-friendly messages

![Extension Popup](screenshots/popup-interface.png)
*(Screenshot: Main extension popup)*

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/subtaitoru-chrome-extension.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from the project

## Development

- **Development Build**:
  ```bash
  npm run watch
  ```

- **Production Build**:
  ```bash
  npm run build
  ```

- **Run Tests**:
  ```bash
  npm test
  ```

## Error Reporting

Found a bug? You can:
1. Click the "Report Bug" button in any error message
2. Use the "Report Bug" option in the extension popup
3. Submit an issue directly on GitHub

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped make this extension better
- Special thanks to the Japanese learning community for feedback and suggestions

---

*Note: Replace placeholder screenshots in the `screenshots` folder with actual screenshots of your features.*
