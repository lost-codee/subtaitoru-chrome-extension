import TinySegmenter from "tiny-segmenter";

export interface ParsedSubtitles {
  startTime: string;
  endTime: string;
  text: string[];
}

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

/**
 * Parse a VTT (WebVTT) string into an array of subtitle objects.
 * The output format is an array of objects with the following properties:
 * - startTime: string representing the start time of the subtitle in the format "HH:MM:SS.MMM"
 * - endTime: string representing the end time of the subtitle in the format "HH:MM:SS.MMM"
 * - text: array of strings representing the individual words (morphemes) in the subtitle text.
 *
 * @param {string} vttData - VTT (WebVTT) string to parse.
 * @returns {ParsedSubtitles[]} - Array of parsed subtitle objects.
 */
export const parseVTT = (vttData: string): ParsedSubtitles[] => {
  const subtitleLines = vttData.split("\n\n");
  return subtitleLines.map((line) => {
    const [time, text] = line.split("\n");
    const [startTime, endTime] = time.split(" --> ");
    const tokenizeText = tokenizeJapaneseText(text);
    return { startTime, endTime, text: tokenizeText };
  });
};
