import { ExamResult, QuestionMistake, QuizQuestion, ExamSettings, QuizMode } from '../types/quiz';

const EXAM_HISTORY_KEY = 'aws-quiz-exam-history';
const MISTAKES_KEY = 'aws-quiz-mistakes';
const APP_STATE_KEY = 'aws-quiz-app-state';

// Application state interface
export interface AppState {
  mode: QuizMode;
  currentExamResult: ExamResult | null;
  examQuestions: QuizQuestion[];
  currentExamSettings: ExamSettings | null;
  lastSaved: Date;
}

export const saveExamResult = (result: ExamResult): void => {
  const existingResults = getExamHistory();
  const updatedResults = [result, ...existingResults];
  localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(updatedResults));
};

export const getExamHistory = (): ExamResult[] => {
  const stored = localStorage.getItem(EXAM_HISTORY_KEY);
  if (!stored) return [];
  
  try {
    const results = JSON.parse(stored);
    return results.map((result: any) => ({
      ...result,
      completedAt: new Date(result.completedAt),
      userAnswers: result.userAnswers.map((answer: any) => ({
        ...answer,
        timestamp: new Date(answer.timestamp)
      }))
    }));
  } catch {
    return [];
  }
};

export const updateQuestionMistakes = (questionSerial: number, question: any): void => {
  const mistakes = getQuestionMistakes();
  const existingMistake = mistakes.find(m => m.questionSerial === questionSerial);
  
  if (existingMistake) {
    existingMistake.mistakeCount++;
    existingMistake.lastMistakeDate = new Date();
  } else {
    mistakes.push({
      questionSerial,
      mistakeCount: 1,
      lastMistakeDate: new Date(),
      question
    });
  }
  
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
};

export const getQuestionMistakes = (): QuestionMistake[] => {
  const stored = localStorage.getItem(MISTAKES_KEY);
  if (!stored) return [];
  
  try {
    const mistakes = JSON.parse(stored);
    return mistakes.map((mistake: any) => ({
      ...mistake,
      lastMistakeDate: new Date(mistake.lastMistakeDate)
    }));
  } catch {
    return [];
  }
};

// Application state persistence functions
export const saveAppState = (state: Partial<AppState>): void => {
  try {
    const currentState = getAppState();
    const updatedState: AppState = {
      ...currentState,
      ...state,
      lastSaved: new Date()
    };
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(updatedState));
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
};

export const getAppState = (): AppState => {
  const stored = localStorage.getItem(APP_STATE_KEY);
  if (!stored) {
    return {
      mode: 'setup',
      currentExamResult: null,
      examQuestions: [],
      currentExamSettings: null,
      lastSaved: new Date()
    };
  }
  
  try {
    const state = JSON.parse(stored);
    return {
      ...state,
      lastSaved: new Date(state.lastSaved),
      currentExamResult: state.currentExamResult ? {
        ...state.currentExamResult,
        completedAt: new Date(state.currentExamResult.completedAt),
        userAnswers: state.currentExamResult.userAnswers.map((answer: any) => ({
          ...answer,
          timestamp: new Date(answer.timestamp)
        }))
      } : null
    };
  } catch (error) {
    console.error('Failed to parse app state:', error);
    return {
      mode: 'setup',
      currentExamResult: null,
      examQuestions: [],
      currentExamSettings: null,
      lastSaved: new Date()
    };
  }
};

export const clearAppState = (): void => {
  localStorage.removeItem(APP_STATE_KEY);
};

export const clearAllData = (): void => {
  localStorage.removeItem(EXAM_HISTORY_KEY);
  localStorage.removeItem(MISTAKES_KEY);
  localStorage.removeItem(APP_STATE_KEY);
}; 