export interface QuizData {
  question: string;
  hint: string;
  correctAnswer: string;
  answers: string[];
}

export interface Word {
  word: string;
  reading: string;
  senses: Array<{ english_definitions: string; parts_of_speech: string }>;
  jlptLevel?: string;
  context?: string;
  confidence?: number;
  srsLevel?: number;
  reviewCount?: number;
  dueDate?: Date;
  lastReviewed?: Date;
}
