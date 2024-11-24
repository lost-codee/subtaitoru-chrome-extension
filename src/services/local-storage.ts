import { JAPANESE_SAVED_WORDS } from "../lib/constants";
import { SavedWords } from "../types";
import { areWordsEqual } from "../utils/are-words-equal";

export const localStorageService = {
  saveWordToStorage: (word: SavedWords) => {
    chrome.storage.local.get([JAPANESE_SAVED_WORDS], (result) => {
      const savedWords: SavedWords[] = result[JAPANESE_SAVED_WORDS] || [];
      if (!savedWords.some((w) => w.word === word.word)) {
        savedWords.push(word);
        chrome.storage.local.set({ [JAPANESE_SAVED_WORDS]: savedWords });
      }
    });
  },
  updateWordInStorage: (word: SavedWords) => {
    chrome.storage.local.get([JAPANESE_SAVED_WORDS], (result) => {
      const savedWords: SavedWords[] = result[JAPANESE_SAVED_WORDS] || [];
      const index = savedWords.findIndex((w) => w.word === word.word);
      if (index !== -1) {
        savedWords[index] = word;
        chrome.storage.local.set({ [JAPANESE_SAVED_WORDS]: savedWords });
      }
    });
  },
  removeWordFromStorage: (word: string) => {
    chrome.storage.local.get([JAPANESE_SAVED_WORDS], (result) => {
      const savedWords: SavedWords[] = result[JAPANESE_SAVED_WORDS] || [];
      const updatedWords = savedWords.filter((w) => w.word !== word);
      chrome.storage.local.set({ [JAPANESE_SAVED_WORDS]: updatedWords });
    });
  },
  getWordFromStorage: (word: string): Promise<SavedWords | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get([JAPANESE_SAVED_WORDS], (result) => {
        const savedWords: SavedWords[] = result[JAPANESE_SAVED_WORDS] || [];
        console.log({ result: savedWords });
        const storedWord = savedWords.find((w: SavedWords) =>
          areWordsEqual(w.word, word)
        );
        resolve(storedWord || null);
      });
    });
  },
  getAllWordsFromStorage: (): Promise<SavedWords[]> => {
    return new Promise((resolve) => {
      chrome.storage.local.get([JAPANESE_SAVED_WORDS], (result) => {
        const savedWords: SavedWords[] = result[JAPANESE_SAVED_WORDS] || [];
        resolve(savedWords);
      });
    });
  },
  deleteWordFromStorage: (word: string) => {
    chrome.storage.local.get([JAPANESE_SAVED_WORDS], (result) => {
      const savedWords: SavedWords[] = result[JAPANESE_SAVED_WORDS] || [];
      const updatedWords = savedWords.filter((w) => w.word !== word);
      chrome.storage.local.set({ [JAPANESE_SAVED_WORDS]: updatedWords });
    });
  },
  deleteAllWordsFromStorage: () => {
    chrome.storage.local.remove(JAPANESE_SAVED_WORDS);
  },
  // Add other methods
};
