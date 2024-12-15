import { useState, useCallback, RefObject, useEffect } from "react";
import * as wanakana from "wanakana";
import { Word } from "../types";
import { SavedWordsService } from "../services/saved-words";
import { TranslationFetcher } from "../services/translation-fetcher";

interface UseTranslationPopupProps {
  videoElement: HTMLVideoElement;
  isMounted: RefObject<boolean>;
}

interface PopupState {
  isVisible: boolean;
  wordDetails: Word | null;
  isFetching: boolean;
}

export const useSubtitles = ({
  videoElement,
  isMounted,
}: UseTranslationPopupProps) => {
  const [popupState, setPopupState] = useState<PopupState>({
    isVisible: false,
    wordDetails: null,
    isFetching: false,
  });
  const storageService = SavedWordsService.getInstance();

  const fetchWordDetails = useCallback(
    async (word: string) => {
      if (!wanakana.isJapanese(word) || !isMounted.current) return;

      videoElement.pause();
      setPopupState((prev) => ({
        ...prev,
        wordDetails: null,
        isVisible: false,
      }));

      const cachedWord = await storageService.getWord(word);

      if (cachedWord && isMounted.current) {
        setPopupState({
          wordDetails: {
            word: cachedWord.word,
            reading: cachedWord.reading,
            senses: cachedWord.senses,
            jlptLevel: cachedWord.jlptLevel,
            confidence: cachedWord.confidence,
          },
          isVisible: true,
          isFetching: false,
        });
        return;
      }

      if (isMounted.current) {
        setPopupState((prev) => ({ ...prev, isFetching: true }));
      }

      try {
        const fetchedWord = await TranslationFetcher.fetchWordTranslation(word);
        if (isMounted.current) {
          setPopupState({
            wordDetails: (fetchedWord && {
              ...fetchedWord,
              word,
              reading: wanakana.isHiragana(word) ? "" : fetchedWord.reading,
            }) || {
              word,
              reading: "",
              jlptLevel: "",
              senses: [],
            },
            isVisible: true,
            isFetching: false,
          });
        }
      } catch (error) {
        console.error("Error fetching word details:", error);
        if (isMounted.current) {
          setPopupState((prev) => ({
            ...prev,
            isFetching: false,
          }));
        }
      }
    },
    [videoElement, isMounted]
  );

  const closePopup = useCallback(() => {
    if (!isMounted.current) return;
    setPopupState((prev) => ({
      ...prev,
      isVisible: false,
      wordDetails: null,
    }));
  }, [isMounted]);

  // if video is playing, close popup
  useEffect(() => {
    if (!isMounted.current) return;
    const handleTimeUpdate = () => {
      if (videoElement.currentTime > 0) {
        closePopup();
      }
    };
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoElement, closePopup, isMounted]);

  return {
    popupState,
    fetchWordDetails,
    closePopup,
  };
};
