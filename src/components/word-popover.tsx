import React, { useState } from "react";

interface WordInfo {
  word: string;
  reading: string;
  meaning?: string;
  partOfSpeech?: string;
  examples?: { japanese: string; english: string }[];
}

interface WordPopoverProps {
  word: WordInfo;
  onClose: () => void;
}

export const WordPopover: React.FC<WordPopoverProps> = ({ word, onClose }) => {
  const [activeTab, setActiveTab] = useState<"info" | "examples">("info");

  return (
    <div className="popover-overlay">
      <div className="popover-content">
        <div className="popover-header">
          <h2 className="popover-title">{word.word}</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close popover"
          >
            X
          </button>
        </div>
        <div className="popover-body">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              Info
            </button>
            <button
              className={`tab-button ${
                activeTab === "examples" ? "active" : ""
              }`}
              onClick={() => setActiveTab("examples")}
            >
              Examples
            </button>
          </div>
          {activeTab === "info" ? (
            <div className="info-content">
              <p>
                <span className="info-label">Reading:</span> {word.reading}
              </p>
              <p>
                <span className="info-label">Meaning:</span> {word.meaning}
              </p>
              <p>
                <span className="info-label">Part of Speech:</span>{" "}
                {word.partOfSpeech}
              </p>
            </div>
          ) : (
            <div className="examples-content">
              {word.examples?.map((example, index) => (
                <div key={index} className="example-item">
                  <p className="example-japanese">{example.japanese}</p>
                  <p className="example-english">{example.english}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
