import { JAPANESE_SAVED_WORDS } from "../lib/constants";
import { SavedWords } from "../types";
import { areWordsEqual } from "../utils/compare-japanese-words";

export class LocalStorageService {
  private static instance: LocalStorageService;
  private storageKey: string;

  private constructor() {
    this.storageKey = JAPANESE_SAVED_WORDS;
  }

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  public async saveWord(word: SavedWords): Promise<void> {
    const savedWords = await this.getAllWords();
    if (!savedWords.some((w) => w.word === word.word)) {
      savedWords.push(word);
      await this.setStorageData(savedWords);
    }
  }

  public async updateWord(word: SavedWords): Promise<void> {
    const savedWords = await this.getAllWords();
    const index = savedWords.findIndex((w) => w.word === word.word);
    if (index !== -1) {
      savedWords[index] = word;
      await this.setStorageData(savedWords);
    }
  }

  public async removeWord(word: string): Promise<void> {
    const savedWords = await this.getAllWords();
    const updatedWords = savedWords.filter((w) => w.word !== word);
    await this.setStorageData(updatedWords);
  }

  public async getWord(word: string): Promise<SavedWords | null> {
    const savedWords = await this.getAllWords();
    const storedWord = savedWords.find((w: SavedWords) =>
      areWordsEqual(w.word, word)
    );
    return storedWord || null;
  }

  public async getAllWords(): Promise<SavedWords[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.storageKey], (result) => {
        const savedWords: SavedWords[] = result[this.storageKey] || [];
        resolve(savedWords);
      });
    });
  }

  public async deleteAllWords(): Promise<void> {
    await this.setStorageData([]);
  }

  private async setStorageData(data: SavedWords[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.storageKey]: data }, () => {
        resolve();
      });
    });
  }
}
