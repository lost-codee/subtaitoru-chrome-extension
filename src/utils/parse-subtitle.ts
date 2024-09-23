import * as wanakana from "wanakana";

export interface Subtitles {
  startTime: string;
  endTime: string;
  text: string[];
}

const tokenizeJapaneseText = (text: string): string[] => {
  // Convert text to Hiragana
  const hiraganaText = wanakana.toHiragana(text);

  // Tokenize the Hiragana text into words
  const tokens = wanakana.tokenize(hiraganaText);

  return tokens as string[];
};

export const parseVTT = (vttData: string): Subtitles[] => {
  const subtitleLines = vttData.split("\n\n");
  return subtitleLines.map((line) => {
    const [time, text] = line.split("\n");
    const [startTime, endTime] = time.split(" --> ");
    const tokenizeText = tokenizeJapaneseText(text);
    return { startTime, endTime, text: tokenizeText };
  });
};
