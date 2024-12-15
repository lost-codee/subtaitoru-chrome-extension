import React, { useState, useCallback, memo, useEffect } from "react";
import { TranslationPopupProps } from "../types";
import { SavedWordsService } from "../services/saved-words";

const TranslationPopupContent: React.FC<TranslationPopupProps> = ({
  word,
  onClose,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedWordService = SavedWordsService.getInstance();

  const jishoUrl = `https://jisho.org/search/${encodeURIComponent(word.word)}`;

  const handleError = useCallback(
    (error: Error, context: string) => {
      setError(`Failed to ${context}. Please try again.`);
      setTimeout(() => setError(null), 3000);
    },
    [word.word]
  );

  const handleSave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        savedWordService.saveWord({
          ...word,
          timestamp: Date.now(),
          confidence: 1,
        });
        setIsSaved(true);
      } catch (err) {
        handleError(err as Error, "save word");
      }
    },
    [word, handleError]
  );

  const handleUnSave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      try {
        savedWordService.removeWord(word.word);
        setIsSaved(false);
      } catch (err) {
        handleError(err as Error, "remove word");
      }
    },
    [word.word, handleError]
  );

  useEffect(() =>{
   savedWordService.getWord(word.word).then((savedWord) => {
      if (savedWord) {
        setIsSaved(true);
      }
    });
  }, [word.word]);

  return (
    <div className="w-[300px] rounded-xl bg-zinc-900/95 text-white shadow-lg backdrop-blur max-h-[400px] overflow-y-auto">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-sm py-2 px-4 text-center">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-end gap-[8px]">
          <ruby>
            {/* @ts-ignore */}
            <rb className="text-[32px] font-bold">{word.word}</rb>
            <rt className="text-[14px]">{word.reading}</rt>
          </ruby>
          {word.jlptLevel && (
            <span className="ml-2 px-[8px] py-[4px] text-[12px] bg-gray-700 text-white rounded-full">
              {word.jlptLevel}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 hover:text-white transition-colors text-zinc-400"
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[100px] border-y border-zinc-800 px-[12px] py-[16px]">
        <div className="text-[14px] leading-relaxed relative">
          {word.senses.length > 0 ? (
            <>
              {word.senses.slice(0, 3).map((sense, index) => (
                <div key={index} className="mb-[8px]">
                  <div className="italic font-semibold">
                    {sense.parts_of_speech}
                  </div>
                  <ul className="list-disc list-inside">
                    {sense.english_definitions}
                  </ul>
                </div>
              ))}
            </>
          ) : (
            <p>No definitions available</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 text-sm text-zinc-400">
        <div className="flex items-center gap-[16px]">
          <a
            className="flex items-center gap-[8px] text-[14px] hover:text-white transition-colors"
            href={jishoUrl}
            target="_blank"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Detail
          </a>
          <button
            className="hover:text-white text-[14px] transition-colors flex items-center gap-[8px]"
            aria-label="Save word"
            onClick={isSaved ? handleUnSave : handleSave}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MemoizedTranslationPopupContent = memo(TranslationPopupContent);

export const TranslationPopup: React.FC<TranslationPopupProps> = (props) => (
 
    <MemoizedTranslationPopupContent {...props} />
 
);
