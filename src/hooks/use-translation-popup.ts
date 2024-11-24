import { useState, useCallback, RefObject } from "react";
import * as wanakana from "wanakana";
import { Word } from "../types";
import { localStorageService } from "../services/local-storage";
import { translationService } from "../services/api";

interface UseTranslationPopupProps {
  videoElement: HTMLVideoElement;
  isMounted: RefObject<boolean>;
}

interface PopupState {
  isVisible: boolean;
  wordDetails: Word | null;
  isFetching: boolean;
  isCached: boolean;
}

export const useTranslationPopup = ({
  videoElement,
  isMounted,
}: UseTranslationPopupProps) => {
  const [popupState, setPopupState] = useState<PopupState>({
    isVisible: false,
    wordDetails: null,
    isFetching: false,
    isCached: false,
  });

  const fetchWordDetails = useCallback(
    async (word: string) => {
      if (!wanakana.isJapanese(word) || !isMounted.current) return;

      videoElement.pause();
      setPopupState((prev) => ({
        ...prev,
        wordDetails: null,
        isVisible: false,
      }));

      const cachedWord = await localStorageService.getWordFromStorage(word);

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
          isCached: true,
        });
        return;
      }

      if (isMounted.current) {
        setPopupState((prev) => ({ ...prev, isFetching: true }));
      }

      try {
        const fetchedWord = await translationService.fetchWordTranslation(word);
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
            isCached: false,
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

  return {
    popupState,
    fetchWordDetails,
    closePopup,
  };
};
