export interface QuizOption {
  optionValue: string;
  isCorrectAns: boolean;
}

export interface QuizQuestion {
  serial: number;
  question: string;
  options: QuizOption[];
  category: string;
}

export interface UserAnswer {
  questionSerial: number;
  selectedOptions: string[];
  isCorrect: boolean;
  timestamp: Date;
}

export interface ExamResult {
  id: string;
  questionsRange: {
    start: number;
    end: number;
  };
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  incorrectAnswers?: number; // Actually answered but wrong
  unattendedQuestions?: number; // Not answered at all
  userAnswers: UserAnswer[];
  completedAt: Date;
  timeTaken: number; // in seconds
}

export interface QuestionMistake {
  questionSerial: number;
  mistakeCount: number;
  lastMistakeDate: Date;
  question: QuizQuestion;
}

export interface ExamSettings {
  startQuestion: number;
  endQuestion: number;
  mode: ExamMode;
}

export type ExamMode = 'practice' | 'exam';

export type QuizMode = 'setup' | 'exam' | 'results' | 'history' | 'mistakes' | 'overview'; 