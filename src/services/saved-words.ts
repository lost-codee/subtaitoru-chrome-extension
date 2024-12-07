import { JAPANESE_SAVED_WORDS } from "../lib/constants";
import { SavedWords } from "../types";
import { areWordsEqual } from "../utils/compare-japanese-words";

/**
 * Service for managing saved Japanese words in Chrome's local storage
 */
export class SavedWordsService {
  private static instance: SavedWordsService;
  private readonly storageKey: string;

  private constructor() {
    this.storageKey = JAPANESE_SAVED_WORDS;
  }

  public static getInstance(): SavedWordsService {
    if (!SavedWordsService.instance) {
      SavedWordsService.instance = new SavedWordsService();
    }
    return SavedWordsService.instance;
  }

  /**
   * Saves a new word if it doesn't already exist
   */
  public async saveWord(word: SavedWords): Promise<boolean> {
    const savedWords = await this.getAllWords();
    if (savedWords.some((w) => areWordsEqual(w.word, word.word))) {
      return false;
    }
    savedWords.push(word);
    await this.setStorageData(savedWords);
    return true;
  }

  /**
   * Updates an existing word's properties
   */
  public async updateWord(word: SavedWords): Promise<boolean> {
    const savedWords = await this.getAllWords();
    const index = savedWords.findIndex((w) => areWordsEqual(w.word, word.word));
    if (index === -1) {
      return false;
    }
    savedWords[index] = word;
    await this.setStorageData(savedWords);
    return true;
  }

  /**
   * Removes a word from saved words
   */
  public async removeWord(word: string): Promise<boolean> {
    const savedWords = await this.getAllWords();
    const initialLength = savedWords.length;
    const updatedWords = savedWords.filter((w) => !areWordsEqual(w.word, word));
    
    if (updatedWords.length === initialLength) {
      return false;
    }
    
    await this.setStorageData(updatedWords);
    return true;
  }

  /**
   * Retrieves a specific word and its properties
   */
  public async getWord(word: string): Promise<SavedWords | null> {
    const savedWords = await this.getAllWords();
    return savedWords.find((w) => areWordsEqual(w.word, word)) || null;
  }

  /**
   * Retrieves all saved words
   */
  public async getAllWords(): Promise<SavedWords[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.storageKey], (result) => {
        resolve(result[this.storageKey] || []);
      });
    });
  }

  /**
   * Removes all saved words
   */
  public async clearAllWords(): Promise<void> {
    await this.setStorageData([]);
  }

  private async setStorageData(data: SavedWords[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.storageKey]: data }, resolve);
    });
  }
}
