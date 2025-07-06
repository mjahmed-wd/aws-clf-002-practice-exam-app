import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { QuizQuestion, QuizMode, ExamSettings, ExamResult } from './types/quiz';
import { getQuestionsByRange } from './utils/quiz';
import { getExamHistory, getQuestionMistakes, saveAppState, getAppState } from './utils/storage';

// Components
import {
  Navbar,
  ExamSetup,
  QuizExam,
  ExamResults,
  ExamHistory,
  MistakesReview,
  ExamOverview
} from './components';

// Import questions data
import questionsData from './data/questions.json';

const App: React.FC = () => {
  // States
  const [mode, setMode] = useState<QuizMode>('setup');
  const [questions] = useState<QuizQuestion[]>(questionsData);
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [currentExamResult, setCurrentExamResult] = useState<ExamResult | null>(null);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [currentExamSettings, setCurrentExamSettings] = useState<ExamSettings | null>(null);

  // Load data on component mount and restore app state
  useEffect(() => {
    // Load persistent data
    setExamHistory(getExamHistory());
    setMistakes(getQuestionMistakes());
    
    // Restore app state
    const savedState = getAppState();
    if (savedState) {
      // Only restore state if it's recent (within 24 hours) to avoid stale data
      const timeDiff = new Date().getTime() - savedState.lastSaved.getTime();
      const isRecent = timeDiff < 24 * 60 * 60 * 1000; // 24 hours
      
      if (isRecent && savedState.mode !== 'setup') {
        setMode(savedState.mode);
        setCurrentExamResult(savedState.currentExamResult);
        setExamQuestions(savedState.examQuestions);
        setCurrentExamSettings(savedState.currentExamSettings);
      }
    }
  }, []);

  // Save app state whenever important state changes
  useEffect(() => {
    saveAppState({
      mode,
      currentExamResult,
      examQuestions,
      currentExamSettings
    });
  }, [mode, currentExamResult, examQuestions, currentExamSettings]);

  // Handle exam setup
  const handleStartExam = (settings: ExamSettings) => {
    const selectedQuestions = getQuestionsByRange(
      questions,
      settings.startQuestion,
      settings.endQuestion
    );
    setExamQuestions(selectedQuestions);
    setCurrentExamSettings(settings);
    setMode('exam');
  };

  // Handle exam completion
  const handleExamComplete = (result: ExamResult) => {
    setCurrentExamResult(result);
    setMode('results');
    setExamHistory(getExamHistory()); // Refresh history
    setMistakes(getQuestionMistakes()); // Refresh mistakes
  };

  // Navigation handlers
  const handleBackToSetup = () => {
    setMode('setup');
    setCurrentExamResult(null);
    setExamQuestions([]);
    setCurrentExamSettings(null);
  };

  const handleViewHistory = () => {
    setMode('history');
  };

  const handleViewMistakes = () => {
    setMode('mistakes');
  };

  const handleViewOverview = () => {
    setMode('overview');
  };

  const handleRetakeExam = () => {
    setMode('exam');
    setCurrentExamResult(null);
  };

  // Render different components based on mode
  const renderContent = () => {
    switch (mode) {
      case 'setup':
        return (
          <ExamSetup
            totalQuestions={questions.length}
            onStartExam={handleStartExam}
            onViewHistory={handleViewHistory}
            onViewMistakes={handleViewMistakes}
            hasHistory={examHistory.length > 0}
            hasMistakes={mistakes.length > 0}
          />
        );

      case 'exam':
        return currentExamSettings ? (
          <QuizExam
            questions={examQuestions}
            examMode={currentExamSettings.mode}
            onComplete={handleExamComplete}
            onExit={handleBackToSetup}
            onPause={() => {
              if (window.confirm('Are you sure you want to pause the exam? You can resume later.')) {
                setMode('setup');
              }
            }}
          />
        ) : null;

      case 'results':
        return currentExamResult ? (
          <ExamResults
            result={currentExamResult}
            questions={examQuestions}
            onBackToSetup={handleBackToSetup}
            onRetakeExam={handleRetakeExam}
            onViewHistory={handleViewHistory}
            onViewOverview={handleViewOverview}
          />
        ) : null;

      case 'history':
        return (
          <ExamHistory
            history={examHistory}
            onBack={handleBackToSetup}
            onViewResult={(result: ExamResult) => {
              // When viewing a result from history, we need to restore the questions
              // Find the original questions range for this exam
              const originalQuestions = getQuestionsByRange(
                questions,
                result.questionsRange.start,
                result.questionsRange.end
              );
              setExamQuestions(originalQuestions);
              setCurrentExamResult(result);
              setMode('results');
            }}
          />
        );

      case 'mistakes':
        return (
          <MistakesReview
            mistakes={mistakes}
            allQuestions={questions}
            onBack={handleBackToSetup}
            onPracticeQuestion={(questionSerial: number) => {
              const question = questions.find(q => q.serial === questionSerial);
              if (question) {
                setExamQuestions([question]);
                setMode('exam');
              }
            }}
          />
        );

      case 'overview':
        return currentExamResult && examQuestions.length > 0 ? (
          <ExamOverview
            result={currentExamResult}
            questions={examQuestions}
            onBack={() => setMode('results')}
            onViewQuestion={(questionSerial) => {
              // This could be used for future navigation to specific questions
              console.log('View question:', questionSerial);
            }}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div className="container">
        {renderContent()}
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#28a745',
            color: 'white',
            fontWeight: '600',
            borderRadius: '8px',
            fontSize: '1rem'
          }
        }}
      />
    </div>
  );
};

export default App; 