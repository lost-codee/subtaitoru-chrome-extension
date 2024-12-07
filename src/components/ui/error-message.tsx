import React from 'react';

interface ErrorMessageProps {
  error: string;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onClose }) => {
  return (
    <div className="bg-red-100 text-red-800 border border-red-300 p-[12px] rounded-md text-center mb-[8px] animate-[fadeIn] shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-[14px]">
          <svg
            className="w-[14px] h-[14px] mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-red-600 hover:text-red-800 transition-colors"
            aria-label="Close error message"
          >
            <svg
              className="w-[14px] h-[14px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};