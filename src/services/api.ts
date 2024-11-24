import { API_ENDPOINTS, COMMON_ENGLISH_WORDS } from "../lib/constants";
import { Word } from "../types";

export const translationService = {
  getWordTranslation: async (word: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSLATION + word);
      if (!response.ok) throw new Error("Failed to fetch word translation");
      return await response.json();
    } catch (error) {
      console.error("Translation service error:", error);
      throw error;
    }
  },
  getCommonWords: async () => {
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
  },
  fetchWordTranslation: async (word: string): Promise<Word | null> => {
    try {
      const apiResponse = await translationService.getWordTranslation(word);
      if (apiResponse && apiResponse.data && apiResponse.data.length > 0) {
        const data = apiResponse.data[0];
        const wordInfo: Word = {
          word: data.japanese[0].word,
          reading: data.japanese[0].reading,
          jlptLevel: data.jlpt.join(", "),
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
  },
};
