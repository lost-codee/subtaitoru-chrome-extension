import * as wanakana from "wanakana";

export const areWordsEqual = (word1: string, word2: string) => {
  const normalizedWord1 = wanakana.toHiragana(word1);
  const normalizedWord2 = wanakana.toHiragana(word2);

  return normalizedWord1 === normalizedWord2;
};
