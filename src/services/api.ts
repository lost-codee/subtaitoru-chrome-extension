import { API_ENDPOINTS } from "../lib/constants";

export const translationService = {
  getCommonWords: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSLATION + "common");
      if (!response.ok) throw new Error("Failed to fetch common words");
      return await response.json();
    } catch (error) {
      console.error("Translation service error:", error);
      throw error;
    }
  },
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

  // Add other API methods
};
