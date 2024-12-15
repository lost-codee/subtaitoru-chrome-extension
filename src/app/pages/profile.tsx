import React, { useState, useEffect } from "react";
import { createRoot } from 'react-dom/client';

// Services
import { SavedWordsService } from "../../services/saved-words";

// Models
import { SavedWords } from "../../types";

// Style
import "../../styles/global.css";

const ProfilePage: React.FC = () => {
  const [learnedWords, setLearnedWords] = useState<SavedWords[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const savedWordsService = SavedWordsService.getInstance();

  useEffect(() => {
    savedWordsService.getAllWords().then((words) => {
      setLearnedWords(words);
    });
  }, []);

  const handleRemoveWord = (wordToRemove: string) => {
    savedWordsService.removeWord(wordToRemove);
    setLearnedWords((prevWords) => prevWords.filter((word) => word.word !== wordToRemove));
  };

  const handleRemoveAll = () => {
    savedWordsService.clearAllWords();
    setLearnedWords([]);
  };

  if (learnedWords.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center p-8">
        <header className="w-full max-w-4xl bg-white shadow rounded p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src="/icon.png"
              alt="User Avatar"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">Welcome!</h2>
              <p className="text-sm text-gray-500">
                Manage your learned words here
              </p>
            </div>
          </div>
        </header>
        <div className="w-full max-w-4xl bg-white shadow rounded p-6">
          <p className="text-sm text-gray-500">No words found.</p>
        </div>
      </div>
    );
  }

  const filteredWords = learnedWords.filter(
    (word) =>
      word.word && word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center p-8">
      <header className="w-full max-w-4xl bg-white shadow rounded p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="/icon.png"
            alt="User Avatar"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">Welcome!</h2>
            <p className="text-sm text-gray-500">
              Manage your learned words here
            </p>
          </div>
        </div>
        <div>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded shadow hover:bg-indigo-600"
            onClick={handleRemoveAll}
          >
            Delete All
          </button>
        </div>
      </header>

      <div className="w-full max-w-4xl bg-white shadow rounded p-6">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            className="border border-gray-300 p-2 rounded shadow-sm w-1/2"
            placeholder="Search learned words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredWords.length === 0 ? (
          <p className="text-center text-gray-500">No learned words yet!</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((word, index) => (
              <li
                key={index}
                className="bg-gray-50 p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="text-gray-500 text-xs">{word.reading}</p>
                  <p className="font-semibold text-lg">{word.word}</p>
                  <p className="text-gray-500 text-sm">
                    {word.senses &&
                      word.senses.length > 0 &&
                      word.senses[0]?.english_definitions}
                  </p>
                  <p className="text-xs text-gray-400">
                    Added on: {new Date(word.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded "
                  onClick={() => handleRemoveWord(word.word)}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ProfilePage />
    </React.StrictMode>
  );
}

export default ProfilePage;
