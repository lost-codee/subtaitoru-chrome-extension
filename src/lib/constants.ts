export const SUBTAITORU_ROOT_ID = "subtaitoru-react-root";
export const QUIZ_ROOT_ID = "subtaitoru-react-root-quiz";

export const PLATFORMS = {
  YOUTUBE: "youtube",
  NETFLIX: "netflix",
  AMAZON_PRIME: "amazon",
} as const;

export const API_ENDPOINTS = {
  TRANSLATION: `${process.env.TRANSLATION_API_URL}?keyword=`,
  // Add other API endpoints
};

export const DEFAULT_FONT_SIZE = "24px";
