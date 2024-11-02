import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

// models
import { ClickedWord } from "../components/subtitles-box";

// style
import "../index.css";

const ManageLearnings: React.FC = () => {
  const [learnedWords, setLearnedWords] = useState<ClickedWord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch learned words from Chrome storage
  useEffect(() => {
    chrome.storage.local.get(["clickedWords"], (result) => {
      if (result.clickedWords) {
        setLearnedWords(result.clickedWords);
      }
    });
  }, []);

  // Remove word from learned words
  const removeWord = (wordToRemove: string) => {
    const updatedWords = learnedWords.filter(
      (word) => word.word !== wordToRemove
    );
    chrome.storage.local.set({ clickedWords: updatedWords }, () => {
      setLearnedWords(updatedWords);
    });
  };

  const handleRemoveAll = () => {
    chrome.storage.local.set({ clickedWords: [] }, () => {
      setLearnedWords([]);
    });
  };

  // Sort words based on selected option (not implemented in this example)
  const sortWords = (words: ClickedWord[]) => {
    // Add sorting logic here if needed
    return words;
  };

  // Filter words based on search term
  const filteredWords = learnedWords.filter(
    (word) =>
      word.word && word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center p-8">
      {/* User Profile Section */}
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

      {/* Main Content Section */}
      <div className="w-full max-w-4xl bg-white shadow rounded p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Search Input */}
          <input
            type="text"
            className="border border-gray-300 p-2 rounded shadow-sm w-1/2"
            placeholder="Search learned words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Learned Words List */}
        {filteredWords.length === 0 ? (
          <p className="text-center text-gray-500">No learned words yet!</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortWords(filteredWords).map((word, index) => (
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
                  onClick={() => removeWord(word.word)}
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

ReactDOM.render(
  <React.StrictMode>
    <ManageLearnings />
  </React.StrictMode>,
  document.getElementById("root")
);

export default ManageLearnings;
