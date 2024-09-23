# Subtitles Browser Extension

## Overview

This project is a browser extension that provides subtitles for videos. It uses React and JavaScript to parse and display subtitles in a overlay on top of the video.

## Features

- Parses VTT (WebVTT) subtitle files and displays them in a overlay on top of the video
- Uses React to render the subtitle overlay and handle user interactions
- Stores subtitle files in local storage using the Chrome storage API
- Allows users to upload their own subtitle files

## Components

- SubtitlesContainer: A React component that renders the subtitle overlay and handles user interactions
- SubtitleOverlay: A React component that displays the subtitle text and handles styling
- WordPopover: A React component that displays a popover with additional information about a word

## Functions

- parseVTT: A function that parses VTT subtitle files and returns an array of subtitle objects
- loadSubtitles: A function that loads subtitle files from local storage and updates the subtitle overlay
- handleFileChange: A function that handles user-uploaded subtitle files and updates local storage

## Styles

The project uses CSS to style the subtitle overlay and popover components

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
