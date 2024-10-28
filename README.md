# Subtitles Browser Extension

## Overview

This project is a browser extension that provides subtitles for videos. It uses React and JavaScript to parse and display subtitles in an overlay on top of the video.

## Features

- Parses VTT (WebVTT) subtitle files and displays them in an overlay on top of the video
- Utilizes React to render the subtitle overlay and manage user interactions
- Stores subtitle files in local storage using the Chrome storage API
- Enables users to upload their own subtitle files
- Supports multiple video platforms for subtitle integration

## Demo

### See it in action

This extension is more than just a subtitle display. It's an interactive learning tool that helps you learn Japanese while watching your favorite TV shows and movies.

#### Get instant definitions and more

Hover over a word to see its definition, JLPT level, and more. The perfect way to learn new vocabulary while watching your favorite shows.

![Screenshot of the extension in action](./screenshots/Screenshot%202024-10-26%20185301.png)

#### Play quizzes to test your knowledge

Test your knowledge of Japanese vocabulary with interactive quizzes. Great way to reinforce your learning and have fun at the same time.

![Screenshot of the extension in action](./screenshots/Screenshot%202024-10-26%20184203.png)

#### Manage your vocabulary

Keep track of the vocabulary you've learned with the built-in vocabulary manager. Add tags, notes, and more to help you remember tricky words.

![Screenshot of the extension in action](./screenshots/Screenshot%202024-10-27%20120828.png)

## Components

- **SubtitlesContainer**: A React component that renders the subtitle overlay and handles user interactions
- **SubtitleOverlay**: A React component that displays the subtitle text and manages styling
- **WordPopover**: A React component that shows a popover with additional information about a word

## Functions

- **parseVTT**: Parses VTT subtitle files and returns an array of subtitle objects
- **loadSubtitles**: Loads subtitle files from local storage and updates the subtitle overlay
- **handleFileChange**: Manages user-uploaded subtitle files and updates local storage
- **toggleOverlay**: Toggles the visibility of the subtitle overlay on and off

## Styles

The project uses CSS and Tailwind CSS to style the subtitle overlay and popover components.

## Installation

To install this project, follow these steps:

1. Clone the repository to your local machine
2. Run `npm install` to install dependencies
3. Build the project using `npm run build`
4. Load the extension into your browser using the `chrome://extensions/` page

## Usage

To use this project, follow these steps:

1. Load a video in your browser
2. Click the extension icon to toggle the subtitle overlay on and off
3. Upload your own subtitle files using the file input field
