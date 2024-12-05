import { COMMON_ENGLISH_WORDS } from "../lib/constants";
import { Word } from "../types";

export class TranslationFetcher {
  private static async getWordTranslation(word: string): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'FETCH_JISHO', word },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }

          if (response && response.success) {
            resolve(response.data);
          } else {
            reject(response?.error || 'Failed to fetch translation');
          }
        }
      );
    });
  }

  static async getCommonWords(): Promise<any> {
    try {
      // Combine all difficulty levels and shuffle them
      const allWords = [
        ...COMMON_ENGLISH_WORDS.BASIC,
        ...COMMON_ENGLISH_WORDS.INTERMEDIATE,
        ...COMMON_ENGLISH_WORDS.ADVANCED,
      ];

      // Simulate API response format
      return {
        data: allWords.map((word) => ({
          senses: [
            {
              english_definitions: [word],
            },
          ],
        })),
      };
    } catch (error) {
      console.error("Error getting common words:", error);
      throw error;
    }
  }

  static async fetchWordTranslation(word: string): Promise<Word | null> {
    try {
      const apiResponse = await this.getWordTranslation(word);
      if (apiResponse && apiResponse.data && apiResponse.data.length > 0) {
        const data = apiResponse.data[0];
        const wordInfo: Word = {
          word: data.japanese[0].word,
          reading: data.japanese[0].reading,
          jlptLevel: data.jlpt?.join(", ") || "",
          senses: data.senses.map((sense: any) => ({
            english_definitions: sense.english_definitions.join(", "),
            parts_of_speech: sense.parts_of_speech.join(", "),
          })),
        };
        return wordInfo;
      }
    } catch (error) {
      console.error("Error fetching translation:", error);
    }
    return null;
  }
}
