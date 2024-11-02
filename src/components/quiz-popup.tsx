import React, { useState, useEffect } from "react";

// components
import { Loading } from "./loading";

// models
import { ClickedWord } from "./subtitles-box";

interface QuizData {
  question: string;
  hint: string;
  correctAnswer: string;
  answers: string[];
}

const API_URL = `${process.env.TRANSLATION_API_URL}?keyword=`;

export const QuizPopup = ({ onClose }: { onClose: () => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wrongAnswerPool, setWrongAnswerPool] = useState<string[]>([]); // Store wrong answers here
  const [quizData, setQuizData] = useState<QuizData[]>([]);

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === quizData[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);

    setTimeout(() => {
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        resetQuestion();
      } else {
        setQuizCompleted(true);
      }
    }, 500);
  };

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
    setShowInfo(false);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    resetQuestion();
    createQuizData();
  };

  useEffect(() => {
    resetQuestion();
  }, [currentQuestion]);

  useEffect(() => {
    const fetchWrongAnswers = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_URL + "common");

        if (!response.ok) {
          throw new Error("Failed to fetch wrong answers");
        }

        const results = await response.json();

        const wrongAnswers = results.data.map(
          (data: any) => data.senses[0].english_definitions[0]
        );

        setWrongAnswerPool(wrongAnswers);
      } catch (error) {
        console.error("Error fetching wrong answers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWrongAnswers();
  }, []);

  const createQuizData = () => {
    chrome.storage.local.get(["clickedWords"], (result) => {
      const clickedWords = result.clickedWords || [];

      if (clickedWords.length > 0 && wrongAnswerPool.length > 0) {
        // Randomly select up to 8 clicked words for quiz questions
        const selectedWords = clickedWords
          .filter((word: ClickedWord) => word.word)
          .sort(() => 0.5 - Math.random()) // Shuffle
          .slice(0, 8); // Limit to 8 questions

        const quizData: QuizData[] = selectedWords.map((word: ClickedWord) => {
          const correctAnswer =
            word.senses[0].english_definitions.split(",")[0];

          // Dynamically select wrong answers from the pool
          const randomWrongAnswers = Array.from(new Set(wrongAnswerPool))
            .filter((answer) => answer !== correctAnswer) // Exclude the correct answer
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 3);

          const answers = [correctAnswer, ...randomWrongAnswers].sort(
            () => 0.5 - Math.random()
          ); // Shuffle answers

          return {
            question: word.word,
            hint: word.reading, // hiragana
            correctAnswer,
            answers,
          };
        });

        setQuizData(quizData);
      }
    });
  };

  useEffect(() => {
    createQuizData();
  }, [wrongAnswerPool]); // Make sure to wait for wrongAnswerPool to be ready

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-transparent p-4 fixed top-0 left-0 right-0 bottom-0 z-[9999]">
        <div className="p-6 relative">
          <Loading />
        </div>
      </div>
    );
  }

  if (quizData.length === 0) {
    return null;
  }

  const progress = ((currentQuestion + 1) / quizData.length) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-transparent p-4 fixed top-0 left-0 right-0 bottom-0 pointer-events-auto z-[9999]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 p-6 relative">
          <h2 className="text-2xl font-bold text-white text-center">
            Quiz Time
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 relative">
          {!quizCompleted ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[14px] font-medium text-gray-600">
                  Level {currentQuestion + 1}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  Score: {score}/{quizData.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="relative">
                <div className="text-8xl font-bold text-center mb-4 text-gray-800">
                  {quizData[currentQuestion].question}
                </div>
                {showHint && (
                  <p className="text-[24px] text-gray-600 text-center mb-4">
                    {quizData[currentQuestion].hint}
                  </p>
                )}
                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>
                {showInfo && (
                  <p className="mt-4 text-gray-600 text-center mb-6">
                    {quizData[currentQuestion].hint}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {quizData[currentQuestion].answers.map((answer, index) => (
                    <button
                      key={index}
                      className={`w-full h-16 text-lg font-semibold rounded-md transition-colors duration-200 ${
                        selectedAnswer === answer
                          ? isCorrect
                            ? "bg-green-100 text-green-800 border-green-500"
                            : "bg-red-100 text-red-800 border-red-500"
                          : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswerClick(answer);
                      }}
                      disabled={selectedAnswer !== null}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Quiz Completed!
              </h2>
              <p className="text-xl mb-6 text-gray-700 font-semibold flex items-center justify-center gap-2">
                <span>
                  Your score: {score}/{quizData.length}
                </span>
                <span className="text-[24px]">{score > 4 ? "🎉" : "☹️"}</span>
              </p>
              <div className="flex justify-center">
                <button
                  onClick={restartQuiz}
                  className="px-4 py-2 text-gray-800 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                >
                  Restart Quiz
                </button>
                <button
                  onClick={onClose}
                  className="ml-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
