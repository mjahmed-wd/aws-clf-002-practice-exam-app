import { QuizQuestion } from '../types/quiz';

export const isMultipleChoice = (question: QuizQuestion): boolean => {
  const correctAnswers = question.options.filter(option => option.isCorrectAns);
  return correctAnswers.length > 1;
};

export const checkAnswer = (
  question: QuizQuestion,
  selectedOptions: string[]
): boolean => {
  const correctOptions = question.options
    .filter(option => option.isCorrectAns)
    .map(option => option.optionValue);
  
  if (correctOptions.length !== selectedOptions.length) {
    return false;
  }
  
  return correctOptions.every(option => selectedOptions.includes(option));
};

export const shuffleQuestions = (questions: QuizQuestion[]): QuizQuestion[] => {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

export const generateExamId = (): string => {
  return `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getQuestionsByRange = (
  questions: QuizQuestion[],
  start: number,
  end: number
): QuizQuestion[] => {
  return questions.filter(q => q.serial >= start && q.serial <= end);
}; 