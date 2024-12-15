// Quiz Types
export interface QuizData {
  question: string;
  hint?: string;
  correctAnswer: string;
  answers: string[];
}

// Word and Translation Types
export interface WordSense {
  english_definitions: string;
  parts_of_speech: string;
}

export interface Word {
  word: string;
  reading?: string;
  senses: Array<WordSense>;
  jlptLevel?: string;
  context?: string;
  confidence?: number; // 0-100
  srsLevel?: number;
  reviewCount?: number;
  dueDate?: Date;
  lastReviewed?: Date;
}

export interface SavedWords extends Word {
  timestamp: number;
}

// Subtitle Types
export interface SubtitlePosition {
  bottom: number;
}

export interface SubtitleState {
  fontSize: number;
  color: string;
  position: SubtitlePosition;
  isMounted: React.RefObject<boolean>;
}

export interface ParsedSubtitles {
  startTime: string;
  endTime: string;
  text: string[];
}

// Translation Service Types
export interface TranslationResponse {
  data: Array<{
    japanese: Array<{
      word?: string;
      reading?: string;
    }>;
    senses: Array<{
      english_definitions: string[];
      parts_of_speech: string[];
    }>;
    jlpt: string[];
  }>;
}

export interface TranslationError extends Error {
  code?: string;
  response?: Response;
}

// Chrome Storage Types
export interface StorageOperation {
  key: string;
  value: any;
}

export interface ChromeStorageChange {
  oldValue?: any;
  newValue?: any;
}

// Component Props Types
export interface SubtitlesProps {
  subtitles: string[] | null;
  dualSubtitles?: string | null;
  videoElement: HTMLVideoElement;
  onWordClick: (word: string) => void;
  className?: string;
  fontSize?: number;
  color?: string;
}

export interface TranslationPopupProps {
  word: Word;
  onClose: () => void;
}

// Hook Types
export interface UseSubtitleStateProps {
  initialPosition?: number;
}

export interface UseDragToMoveProps {
  elementRef: React.RefObject<HTMLElement>;
  isMounted: React.RefObject<boolean>;
  onPositionChange: (position: SubtitlePosition) => void;
}

export interface UseTranslationPopupProps {
  videoElement: HTMLVideoElement;
  isMounted: React.RefObject<boolean>;
}

export interface PopupState {
  isVisible: boolean;
  wordDetails: Word | null;
  isFetching: boolean;
  isCached: boolean;
}

export interface Settings {
  fontSize?: string;
  fontColor?: string;
  showSubtitles?: boolean;
}


export interface CaptionsTokenized {
  start: number;
  end: number;
  text: string[];
}

export interface ParsedSubtitle {
  start: number;
  end: number;
  text: string;
}