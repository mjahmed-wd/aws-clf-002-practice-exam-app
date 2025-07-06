import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { QuizQuestion, UserAnswer, ExamResult, ExamMode } from '../types/quiz';
import { isMultipleChoice, checkAnswer, generateExamId, formatTime } from '../utils/quiz';
import { saveExamResult, updateQuestionMistakes } from '../utils/storage';

interface QuizExamProps {
  questions: QuizQuestion[];
  examMode: ExamMode;
  onComplete: (result: ExamResult) => void;
  onExit: () => void;
  onPause?: () => void;
}

const QuizExam: React.FC<QuizExamProps> = ({ questions, examMode, onComplete, onExit, onPause }) => {
  // States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [startTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const currentQuestion = questions[currentQuestionIndex];



  // Shuffle array function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle options for current question
  const [shuffledOptions, setShuffledOptions] = useState<typeof currentQuestion.options>([]);

  // Reset selected options and shuffle when question changes
  useEffect(() => {
    setSelectedOptions([]);
    setShowResults(false);
    setIsAutoAdvancing(false);
    // Shuffle the options for the current question
    if (currentQuestion && currentQuestion.options) {
      setShuffledOptions(shuffleArray(currentQuestion.options));
    }
  }, [currentQuestionIndex, currentQuestion]);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    if (showResults || isAutoAdvancing) return; // Prevent selection after showing results or during auto-advance

    const isMultiple = isMultipleChoice(currentQuestion);
    
    if (isMultiple) {
      // Multiple choice - toggle selection
      setSelectedOptions(prev => 
        prev.includes(optionValue)
          ? prev.filter(option => option !== optionValue)
          : [...prev, optionValue]
      );
    } else {
      // Single choice - replace selection
      setSelectedOptions([optionValue]);
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (selectedOptions.length === 0) return;

    const isCorrect = checkAnswer(currentQuestion, selectedOptions);
    
    const userAnswer: UserAnswer = {
      questionSerial: currentQuestion.serial,
      selectedOptions: [...selectedOptions],
      isCorrect,
      timestamp: new Date()
    };

    setUserAnswers(prev => [...prev, userAnswer]);

    // Track mistakes
    if (!isCorrect) {
      updateQuestionMistakes(currentQuestion.serial, currentQuestion);
    }

    setShowResults(true);

    // Auto-advance logic for practice mode
    if (examMode === 'practice') {
      if (isCorrect) {
        setIsAutoAdvancing(true);
        
        // Show success toast and auto-advance to next question
        const messages = [
          '✅ Correct! Great job!',
          '🎯 Perfect! Moving on...',
          '⭐ Excellent! Next question coming up...',
          '🔥 Well done! Advancing...',
          '💪 Spot on! Keep it up!'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        toast.success(randomMessage, {
          duration: 1400,
          style: {
            background: '#28a745',
            color: 'white',
            fontWeight: '600',
            borderRadius: '8px',
            fontSize: '1rem',
            minWidth: '250px'
          }
        });
        
        setTimeout(() => {
          if (isLastQuestion) {
            toast.success('🎉 Practice completed! Excellent work!', {
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: '600',
                borderRadius: '8px',
                fontSize: '1rem',
                minWidth: '300px'
              }
            });
            setTimeout(() => {
              handleCompleteExam();
            }, 2000);
          } else {
            setCurrentQuestionIndex(prev => prev + 1);
          }
        }, 1500); // Wait 1.5 seconds to show the toast
      }
      // For incorrect answers, don't auto-advance - user needs to click next
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      handleCompleteExam();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Complete exam
  const handleCompleteExam = () => {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const incorrectAnswers = userAnswers.filter(answer => !answer.isCorrect).length;
    const unattendedQuestions = questions.length - userAnswers.length;
    const wrongAnswers = incorrectAnswers + unattendedQuestions; // Include unattended as wrong

    const result: ExamResult = {
      id: generateExamId(),
      questionsRange: {
        start: questions[0]?.serial || 1,
        end: questions[questions.length - 1]?.serial || 1
      },
      totalQuestions: questions.length,
      correctAnswers,
      wrongAnswers,
      incorrectAnswers,
      unattendedQuestions,
      userAnswers,
      completedAt: new Date(),
      timeTaken: elapsedTime
    };

    saveExamResult(result);
    onComplete(result);
  };

  // Exit confirmation
  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
      onExit();
    }
  };

  // Get option styling classes
  const getOptionClasses = (optionValue: string, isCorrect: boolean): string => {
    let classes = 'option-label';
    
    if (selectedOptions.includes(optionValue)) {
      classes += ' selected';
    }
    
    if (showResults) {
      if (isCorrect) {
        classes += ' correct';
      } else if (selectedOptions.includes(optionValue) && !isCorrect) {
        classes += ' incorrect';
      }
    }
    
    return classes;
  };

  return (
    <div className={examMode === 'practice' ? 'practice-layout' : ''} style={{ display: 'flex', gap: examMode === 'practice' ? '1rem' : '0' }}>
      {/* Sidebar for Practice Mode */}
      {examMode === 'practice' && (
        <div className="practice-sidebar" style={{
          width: '300px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          height: 'fit-content',
          position: 'sticky',
          top: '1rem'
        }}>
          <h3 style={{ 
            marginBottom: '1rem', 
            color: '#2c3e50',
            fontSize: '1.1rem',
            textAlign: 'center'
          }}>
            Questions Overview
          </h3>
          
          <div className="practice-questions-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {questions.map((question, index) => {
              const answer = userAnswers.find(ua => ua.questionSerial === question.serial);
              const isCurrentQuestion = index === currentQuestionIndex;
              
              let bgColor = '#f8f9fa';
              let textColor = '#6c757d';
              let border = '2px solid #e9ecef';
              
              if (isCurrentQuestion) {
                bgColor = '#667eea';
                textColor = 'white';
                border = '2px solid #667eea';
              } else if (answer) {
                if (answer.isCorrect) {
                  bgColor = '#28a745';
                  textColor = 'white';
                  border = '2px solid #28a745';
                } else {
                  bgColor = '#dc3545';
                  textColor = 'white';
                  border = '2px solid #dc3545';
                }
              }
              
              return (
                <button
                  key={question.serial}
                  onClick={() => setCurrentQuestionIndex(index)}
                  style={{
                    background: bgColor,
                    color: textColor,
                    border,
                    borderRadius: '6px',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '35px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentQuestion) {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {question.serial}
                </button>
              );
            })}
          </div>
          
          <div style={{
            fontSize: '0.875rem',
            color: '#6c757d',
            textAlign: 'center',
            borderTop: '1px solid #e9ecef',
            paddingTop: '1rem'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              ✅ <span style={{ color: '#28a745', fontWeight: '600' }}>
                {userAnswers.filter(ua => ua.isCorrect).length}
              </span> Correct
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ❌ <span style={{ color: '#dc3545', fontWeight: '600' }}>
                {userAnswers.filter(ua => !ua.isCorrect).length}
              </span> Incorrect
            </div>
            <div>
              ⏸️ <span style={{ color: '#6c757d', fontWeight: '600' }}>
                {questions.length - userAnswers.length}
              </span> Remaining
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Timer */}
        <div className="timer">
          <div className="timer-text">
            Time: {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Progress */}
        <div className="card">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

      {/* Question */}
      <div className="card question-card">
        <div className="question-header">
          <div className="question-number">
            Question {currentQuestion.serial}
          </div>
          <div className="question-category">
            {currentQuestion.category}
          </div>
        </div>

        <div className="question-text">
          {currentQuestion.question}
        </div>

        {/* Instructions for multiple choice */}
        {isMultipleChoice(currentQuestion) && !showResults && (
          <div style={{ 
            background: '#e3f2fd', 
            color: '#1565c0', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            <strong>Multiple Choice:</strong> Select all correct answers
          </div>
        )}

        {/* Options */}
        <ul className="options-list">
          {shuffledOptions.map((option, index) => (
            <li key={`${currentQuestion.serial}-${option.optionValue}`} className="option-item">
              <div 
                className={getOptionClasses(option.optionValue, option.isCorrectAns)}
                style={{ cursor: (showResults || isAutoAdvancing) ? 'default' : 'pointer' }}
                onClick={() => !(showResults || isAutoAdvancing) && handleOptionSelect(option.optionValue)}
              >
                <input
                  type={isMultipleChoice(currentQuestion) ? 'checkbox' : 'radio'}
                  className="option-input"
                  checked={selectedOptions.includes(option.optionValue)}
                  onChange={() => handleOptionSelect(option.optionValue)}
                  disabled={showResults || isAutoAdvancing}
                  style={{ cursor: (showResults || isAutoAdvancing) ? 'default' : 'pointer' }}
                />
                <span 
                  className="option-text"
                  style={{ cursor: (showResults || isAutoAdvancing) ? 'default' : 'pointer' }}
                >
                  {option.optionValue}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Answer feedback */}
        {showResults && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            background: userAnswers[userAnswers.length - 1]?.isCorrect 
              ? 'rgba(40, 167, 69, 0.1)' 
              : 'rgba(220, 53, 69, 0.1)',
            border: `2px solid ${userAnswers[userAnswers.length - 1]?.isCorrect 
              ? '#28a745' 
              : '#dc3545'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>
                {userAnswers[userAnswers.length - 1]?.isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
              </strong>
              {examMode === 'practice' && userAnswers[userAnswers.length - 1]?.isCorrect && (
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#28a745', 
                  fontStyle: 'italic' 
                }}>
                  Auto-advancing...
                </span>
              )}
            </div>
            {!userAnswers[userAnswers.length - 1]?.isCorrect && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                <strong>Correct answer(s):</strong> {currentQuestion.options
                  .filter(option => option.isCorrectAns)
                  .map(option => option.optionValue)
                  .join(', ')
                }
                {examMode === 'practice' && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    color: '#6c757d', 
                    fontStyle: 'italic' 
                  }}>
                    Click "Next Question" to continue
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="navigation">
          <div className="nav-buttons">
            <button 
              className="btn btn-secondary"
              onClick={handleExit}
            >
              Exit Exam
            </button>
            {onPause && (
              <button 
                className="btn btn-warning"
                onClick={onPause}
              >
                Pause Exam
              </button>
            )}
            {examMode === 'practice' && currentQuestionIndex > 0 && (
              <button 
                className="btn btn-secondary"
                onClick={handlePreviousQuestion}
              >
                Previous
              </button>
            )}
          </div>

          <div className="nav-buttons">
            {examMode === 'practice' && userAnswers.length === questions.length && (
              <button
                className="btn btn-success"
                onClick={handleCompleteExam}
              >
                Finish Practice
              </button>
            )}
            {!showResults ? (
              <button
                className="btn"
                onClick={handleSubmitAnswer}
                disabled={selectedOptions.length === 0 || isAutoAdvancing}
              >
                Submit Answer
              </button>
            ) : (
              // Show Next button only for exam mode or incorrect answers in practice mode
              (examMode === 'exam' || !userAnswers[userAnswers.length - 1]?.isCorrect) && (
                <button
                  className="btn"
                  onClick={handleNextQuestion}
                >
                  {isLastQuestion ? 'Complete Exam' : 'Next Question'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default QuizExam; 