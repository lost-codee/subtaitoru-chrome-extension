import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TranslationFetcher } from "../services/translation-fetcher";
import { SavedWordsService } from "../services/saved-words";

// Components
import { Loading } from "./ui/loading";

// Models
import { QuizData, SavedWords } from "../types";

// Types
interface QuizPopupProps {
  onClose: () => void;
}

interface AnswerButtonProps {
  answer: string;
  isSelected: boolean;
  isCorrect: boolean | null;
  onClick: (answer: string) => void;
  disabled: boolean;
}

// Components
const AnswerButton: React.FC<AnswerButtonProps> = ({
  answer,
  isSelected,
  isCorrect,
  onClick,
  disabled,
}) => (
  <button
    className={`w-full h-[64px] text-[18px] font-semibold rounded-md transition-colors duration-200 ${
      isSelected
        ? isCorrect
          ? "bg-green-100 text-green-800 border-green-500"
          : "bg-red-100 text-red-800 border-red-500"
        : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
    }`}
    onClick={(e) => {
      e.stopPropagation();
      onClick(answer);
    }}
    disabled={disabled}
    aria-pressed={isSelected}
    role="option"
    aria-selected={isSelected}
  >
    {answer}
  </button>
);

const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-[16px] right-[16px] text-gray-400 hover:text-gray-600"
    aria-label="Close quiz"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-[24px] w-[24px]"
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
);

export const QuizPopup: React.FC<QuizPopupProps> = ({ onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wrongAnswerPool, setWrongAnswerPool] = useState<string[]>([]);
  const [quizData, setQuizData] = useState<QuizData[]>([]);
  const storageService = SavedWordsService.getInstance();

  const handleAnswerClick = useCallback(
    (answer: string) => {
      setSelectedAnswer(answer);
      const correct = answer === quizData[currentQuestion]?.correctAnswer;
      setIsCorrect(correct);
      if (correct) setScore((prev) => prev + 1);

      setTimeout(() => {
        if (currentQuestion < quizData.length - 1) {
          setCurrentQuestion((prev) => prev + 1);
          resetQuestion();
        } else {
          setQuizCompleted(true);
        }
      }, 500);
    },
    [currentQuestion, quizData]
  );

  const resetQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
  }, []);

  const restartQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    resetQuestion();
    createQuizData();
  }, [resetQuestion]);

  const createQuizData = useCallback(async () => {
    try {
      const savedWords = await storageService.getAllWords();

      if (savedWords.length > 0 && wrongAnswerPool.length > 0) {
        const selectedWords = savedWords
          .filter((word: SavedWords) => word.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);

        const quizData: QuizData[] = selectedWords.map((word: SavedWords) => {
          const correctAnswer =
            word.senses[0].english_definitions.split(",")[0];

          // Improved wrong answer selection logic
          const similarLengthAnswers = wrongAnswerPool.filter(
            (answer) =>
              answer !== correctAnswer &&
              // Select answers with similar length (±3 characters)
              Math.abs(answer.length - correctAnswer.length) <= 3
          );

          // If we don't have enough similar length answers, fall back to the full pool
          const answersPool =
            similarLengthAnswers.length >= 3
              ? similarLengthAnswers
              : wrongAnswerPool.filter((answer) => answer !== correctAnswer);

          // Get random wrong answers
          const randomWrongAnswers = answersPool
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

          return {
            question: word.word,
            hint: word.reading,
            correctAnswer,
            answers: [correctAnswer, ...randomWrongAnswers].sort(
              () => 0.5 - Math.random()
            ),
          };
        });

        setQuizData(quizData);
      }
    } catch (error) {
      setError("Failed to create quiz data. Please try again.");
      console.error("Error creating quiz data:", error);
    }
  }, [wrongAnswerPool]);

  useEffect(() => {
    const fetchWrongAnswers = async () => {
      setLoading(true);
      try {
        const response = await TranslationFetcher.getCommonWords();
        if (!response) {
          throw new Error("Failed to fetch wrong answers");
        }

        // Filter out single character words and numbers
        const pageAnswers = response.data
          .filter((data: any) => {
            const definition = data.senses[0].english_definitions[0];
            return (
              definition.length > 1 && // Exclude single characters
              !/^\d+$/.test(definition) && // Exclude numbers
              !/^[!@#$%^&*(),.?":{}|<>]/.test(definition) // Exclude special characters
            );
          })
          .map((data: any) => data.senses[0].english_definitions[0]);

        // Shuffle the answers for better randomization
        const shuffledAnswers = pageAnswers.sort(() => 0.5 - Math.random());
        setWrongAnswerPool(shuffledAnswers);
      } catch (error) {
        setError("Failed to fetch quiz data. Please try again.");
        console.error("Error fetching wrong answers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWrongAnswers();
  }, []);

  useEffect(() => {
    resetQuestion();
  }, [currentQuestion, resetQuestion]);

  useEffect(() => {
    if (wrongAnswerPool.length > 0) {
      createQuizData();
    }
  }, [wrongAnswerPool, createQuizData]);

  const progress = useMemo(
    () => ((currentQuestion + 1) / quizData.length) * 100,
    [currentQuestion, quizData.length]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-transparent p-[16px] fixed top-0 left-0 right-0 bottom-0 z-[9999]">
        <div className="p-[24px] relative">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-transparent p-[16px] fixed top-0 left-0 right-0 bottom-0 z-[9999]">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-[24px] text-center">
          <h2 className="text-[24px] font-bold text-red-600 mb-[16px]">
            Error
          </h2>
          <p className="text-gray-700 mb-[16px]">{error}</p>
          <button
            onClick={onClose}
            className="px-[16px] py-[8px] bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (quizData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-transparent p-[16px] fixed top-0 left-0 right-0 bottom-0 z-[9999]">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 p-[24px] relative">
            <h2 className="text-[24px] font-bold text-white text-center">
              No Data Available
            </h2>
            <CloseButton onClick={onClose} />
            <p className="text-center text-gray-400 text-[14px] mt-[8px]">
              Please add some words to your vocabulary list first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-transparent p-[16px] fixed top-0 left-0 right-0 bottom-0 pointer-events-auto z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-title"
    >
      <div className="w-full min-w-[400px] max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 p-[24px] relative">
          <h2
            id="quiz-title"
            className="text-[24px] font-bold text-white text-center"
          >
            Quiz Time
          </h2>
          <CloseButton onClick={onClose} />
        </div>
        <div className="p-[24px] relative">
          {!quizCompleted ? (
            <>
              <div className="flex justify-between items-center mb-[16px]">
                <span className="text-[14px] font-medium text-gray-600">
                  Level {currentQuestion + 1}
                </span>
                <span className="text-[14px] font-medium text-gray-600">
                  Score: {score}/{quizData.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-[10px] mb-[24px]">
                <div
                  className="bg-blue-600 h-[10px] rounded-full"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="relative">
                <div className="text-[64px] font-bold text-center mb-[16px] text-gray-800 leading-normal">
                  {quizData[currentQuestion].question}
                </div>
                {showHint && (
                  <p className="text-[24px] text-gray-600 text-center mb-[16px]">
                    {quizData[currentQuestion].hint}
                  </p>
                )}
                <div className="flex justify-center gap-[16px] mb-[24px]">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="p-[8px] rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800"
                    aria-label={showHint ? "Hide hint" : "Show hint"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-[24px] w-[24px]"
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
                <div
                  className="grid grid-cols-2 gap-[16px] mb-[24px]"
                  role="listbox"
                >
                  {quizData[currentQuestion].answers.map((answer, index) => (
                    <AnswerButton
                      key={index}
                      answer={answer}
                      isSelected={selectedAnswer === answer}
                      isCorrect={isCorrect}
                      onClick={handleAnswerClick}
                      disabled={selectedAnswer !== null}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-[32px] font-bold mb-[16px] text-gray-800">
                Quiz Completed!
              </h2>
              <p className="text-[20px] mb-[24px] text-gray-700 font-semibold flex items-center justify-center gap-[8px]">
                <span>
                  Your score: {score}/{quizData.length}
                </span>
                <span className="text-[24px]">{score > 4 ? "🎉" : "☹️"}</span>
              </p>
              <div className="flex justify-center gap-[16px]">
                <button
                  onClick={restartQuiz}
                  className="px-[16px] py-[8px] text-gray-800 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                >
                  Restart Quiz
                </button>
                <button
                  onClick={onClose}
                  className="px-[16px] py-[8px] bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors duration-200"
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
