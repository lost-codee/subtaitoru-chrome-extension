import React from "react";
import ErrorBoundary from "./error-boundary";
import { Word } from "../types";

interface TranslationPopupProps {
  word: Word;
  onClose: () => void;
}

export const TranslationPopup: React.FC<TranslationPopupProps> = ({
  word,
  onClose,
}) => {
  // Generate the Jisho URL for the word
  const jishoUrl = `https://jisho.org/search/${encodeURIComponent(word.word)}`;

  const openJisho = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    window.open(jishoUrl, "_blank");
  };

  return (
    <ErrorBoundary>
      <div className="bg-black/90 text-white rounded-xl p-4 w-[300px] shadow-lg relative flex flex-col gap-4  max-h-[400px] overflow-y-auto">
        {/* Word Header with reading and JLPT level if available */}
        <div className="text-5xl font-bold leading-tight">
          <span className="block text-[14px] text-gray-300 mb-1">
            {word.reading}
          </span>
          <span className="relative block text-white">
            {word.word}
            {/* Add JLPT level if available */}
            {word.jlptLevel && (
              <span className="ml-2 px-2 py-1 text-[12px] bg-gray-700 text-white rounded-full">
                {word.jlptLevel}
              </span>
            )}
          </span>
        </div>

        {/* Word Definitions */}
        <div className="text-[14px] leading-relaxed relative">
          {word.senses.length > 0 ? (
            <>
              {word.senses.slice(0, 3).map((sense, index) => (
                <div key={index} className="mb-2">
                  <div className="italic font-semibold">
                    {sense.parts_of_speech}
                  </div>
                  <ul className="list-disc list-inside">
                    {sense.english_definitions}
                  </ul>
                </div>
              ))}
              {/* Add Jisho link */}
              <a
                onClick={openJisho}
                href={jishoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="More information on Jisho"
                className="text-[20px] text-gray-400 hover:text-white transition-colors absolute right-0 top-0"
              >
                🛈
              </a>
            </>
          ) : (
            <p>No definitions available</p>
          )}
        </div>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="absolute top-4 right-4 text-xl text-gray-400 hover:text-gray-100 transition-colors"
        >
          ✕
        </button>
      </div>
    </ErrorBoundary>
  );
};
