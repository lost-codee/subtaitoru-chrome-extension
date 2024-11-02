import TinySegmenter from "tiny-segmenter";

const segmenter = new TinySegmenter();

/**
 * Tokenize a given Japanese string into individual words (morphemes).
 * The word boundary detection is done by the TinySegmenter library.
 *
 * @param {string} text - Japanese text to tokenize.
 * @returns {string[]} - Array of individual words (morphemes) in the text.
 */
export const tokenizeJapaneseText = (text: string): string[] => {
  const tokens = segmenter.segment(text);
  return tokens as string[];
};
