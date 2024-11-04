import React, { useEffect, useState } from "react";
import * as wanakana from "wanakana";

// components
import { Loading } from "./loading";

// Models
import { TranslationPopup } from "./translation-popup";
import { Word } from "../types";

// utils
import { cn } from "../utils/cn";

export interface SubtitleOverlayProps {
  subtitles: string[] | null | undefined;
  videoElement: HTMLVideoElement;
}

export interface ClickedWord extends Word {
  timestamp: number;
}

// Utility to store and retrieve words from Chrome Storage
const saveWordToStorage = (word: ClickedWord) => {
  chrome.storage.local.get(["clickedWords"], (result) => {
    const clickedWords: ClickedWord[] = result.clickedWords || [];
    if (!clickedWords.some((w) => w.word === word.word)) {
      clickedWords.push(word);
      chrome.storage.local.set({ clickedWords });
    }
  });
};

const getWordFromStorage = (word: string): Promise<ClickedWord | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["clickedWords"], (result) => {
      const clickedWords: ClickedWord[] = result.clickedWords || [];
      const storedWord = clickedWords.find((w) => areWordsEqual(w.word, word));
      resolve(storedWord || null);
    });
  });
};

// Fetch translation data from API
const fetchWordTranslation = async (word: string): Promise<Word | null> => {
  try {
    const response = await fetch(
      `${process.env.TRANSLATION_API_URL}?keyword=${word}`
    );
    const apiResponse = await response.json();
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
};

// Function to compare two words
const areWordsEqual = (word1: string, word2: string) => {
  const normalizedWord1 = wanakana.toHiragana(word1);
  const normalizedWord2 = wanakana.toHiragana(word2);

  return normalizedWord1 === normalizedWord2;
};

export const SubtitlesBox = React.forwardRef<
  HTMLDivElement,
  SubtitleOverlayProps
>(({ subtitles, videoElement }, ref) => {
  const [showWordPopup, setShowWordPopup] = useState(false);
  const [wordInfo, setWordInfo] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnWordClick = async (word: string) => {
    if (wanakana.isJapanese(word)) {
      if (videoElement) {
        videoElement.pause();
      }
      setWordInfo(null);
      setShowWordPopup(false);

      // Check if the word is already in storage
      const storedWord = await getWordFromStorage(word);

      if (storedWord) {
        setWordInfo({
          word: storedWord.word,
          reading: storedWord.reading,
          senses: storedWord.senses,
        });
        setShowWordPopup(true);
        return;
      }

      // If not found in storage, fetch translation
      setIsLoading(true);
      const translation = await fetchWordTranslation(word);
      setIsLoading(false);

      if (translation) {
        setWordInfo(translation);
        setShowWordPopup(true);
        saveWordToStorage({
          word: translation.word,
          reading: translation.reading,
          senses: translation.senses,
          timestamp: Date.now(),
        });
      } else {
        setWordInfo({
          word: word,
          reading: "",
          jlptLevel: "",
          senses: [],
        });
        setShowWordPopup(true);
      }
    }
  };

  // effect to handle play event and close the popup
  useEffect(() => {
    const handleVideoPlay = () => {
      setShowWordPopup(false);
      setWordInfo(null);
    };

    if (videoElement) {
      videoElement.addEventListener("play", handleVideoPlay);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("play", handleVideoPlay);
      }
    };
  }, [videoElement]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2 items-center pointer-events-auto cursor-pointer",
        subtitles ? "" : "hidden"
      )}
    >
      {showWordPopup && wordInfo && (
        <TranslationPopup
          word={wordInfo}
          onClose={() => setShowWordPopup(false)}
        />
      )}
      {isLoading && (
        <div className="bg-white text-black p-2 rounded-md text-center mb-2 w-64 animate-[fadeIn]">
          <div className="flex items-center justify-center text-[14px]">
            <span>Waiting for translation</span>
            <Loading />
          </div>
        </div>
      )}
      <div className="bg-black bg-opacity-75 text-white p-4 rounded-lg shadow-md leading-normal">
        {subtitles?.map((word, index) => (
          <span
            key={index}
            className="inline-block cursor-pointer px-1 rounded transition-colors duration-300 ease-in-out hover:bg-white hover:bg-opacity-20"
            onClick={(event) => {
              event.stopPropagation();
              handleOnWordClick(word);
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
});
