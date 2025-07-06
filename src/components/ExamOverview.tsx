import React, { useState, useMemo } from 'react';
import { ExamResult, QuizQuestion } from '../types/quiz';
import { formatTime } from '../utils/quiz';

interface ExamOverviewProps {
  result: ExamResult;
  questions: QuizQuestion[];
  onBack: () => void;
  onViewQuestion: (questionSerial: number) => void;
}

interface CategoryStats {
  category: string;
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
}

type FilterType = 'all' | 'correct' | 'incorrect';

const ExamOverview: React.FC<ExamOverviewProps> = ({
  result,
  questions,
  onBack,
  onViewQuestion
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // Safety check for missing data
  if (!result || !questions || questions.length === 0) {
    return (
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>
            Exam Overview
          </h2>
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Results
          </button>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6c757d',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ Data Not Available</h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            The detailed overview data is not available for this exam.
          </p>
          <p style={{ marginBottom: '2rem' }}>
            This can happen when viewing older exam results after a page refresh.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={onBack}>
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate category statistics
  const categoryStats = useMemo((): CategoryStats[] => {
    const statsMap = new Map<string, CategoryStats>();

    questions.forEach(question => {
      const userAnswer = result.userAnswers.find(ua => ua.questionSerial === question.serial);
      if (!userAnswer) return;

      const category = question.category;
      if (!statsMap.has(category)) {
        statsMap.set(category, {
          category,
          total: 0,
          correct: 0,
          incorrect: 0,
          percentage: 0
        });
      }

      const stats = statsMap.get(category)!;
      stats.total++;
      if (userAnswer.isCorrect) {
        stats.correct++;
      } else {
        stats.incorrect++;
      }
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    return Array.from(statsMap.values()).sort((a, b) => a.category.localeCompare(b.category));
  }, [result, questions]);

  // Filter questions based on selected category and type
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const userAnswer = result.userAnswers.find(ua => ua.questionSerial === question.serial);
      if (!userAnswer) return false;

      // Category filter
      if (selectedCategory !== 'all' && question.category !== selectedCategory) {
        return false;
      }

      // Correctness filter
      if (filterType === 'correct' && !userAnswer.isCorrect) return false;
      if (filterType === 'incorrect' && userAnswer.isCorrect) return false;

      return true;
    });
  }, [questions, result, selectedCategory, filterType]);

  const overallPercentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const passed = overallPercentage >= 70;

  const toggleQuestionExpansion = (questionSerial: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionSerial)) {
      newExpanded.delete(questionSerial);
    } else {
      newExpanded.add(questionSerial);
    }
    setExpandedQuestions(newExpanded);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#28a745';
    if (percentage >= 70) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div>
      {/* Header */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>
            Exam Overview
          </h2>
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Results
          </button>
        </div>

        {/* Overall Score */}
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: passed ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
          borderRadius: '15px',
          marginBottom: '2rem',
          border: `2px solid ${passed ? '#28a745' : '#dc3545'}`
        }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: getScoreColor(overallPercentage),
            marginBottom: '0.5rem'
          }}>
            {overallPercentage}%
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: passed ? '#28a745' : '#dc3545',
            marginBottom: '1rem'
          }}>
            {passed ? '✓ PASSED' : '✗ FAILED'}
          </div>
          <div style={{ color: '#6c757d' }}>
            {result.correctAnswers}/{result.totalQuestions} correct • {formatTime(result.timeTaken)}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
          Performance by Category
        </h3>

        <div style={{ marginBottom: '2rem' }}>
          {categoryStats.map((stats, index) => (
            <div
              key={stats.category}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                marginBottom: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                animation: 'slideInUp 0.5s ease forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  {stats.category}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  {stats.correct}/{stats.total} questions • {stats.incorrect} mistakes
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Progress Bar */}
                <div style={{
                  width: '150px',
                  height: '8px',
                  background: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${stats.percentage}%`,
                    height: '100%',
                    background: getScoreColor(stats.percentage),
                    transition: 'width 1s ease',
                    animation: `progressFill 1.5s ease forwards`,
                    animationDelay: `${index * 0.2}s`,
                    borderRadius: '4px'
                  }}></div>
                </div>

                {/* Percentage */}
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: getScoreColor(stats.percentage),
                  minWidth: '50px',
                  textAlign: 'right'
                }}>
                  {stats.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Review */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
          Question Review
        </h3>

        {/* Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          animation: 'slideInLeft 0.6s ease forwards',
          transition: 'all 0.3s ease'
        }}>
          {/* Category Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#495057'
            }}>
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                background: 'white',
                fontSize: '0.875rem',
                minWidth: '200px'
              }}
            >
              <option value="all">All Categories</option>
              {categoryStats.map(stats => (
                <option key={stats.category} value={stats.category}>
                  {stats.category} ({stats.total})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#495057'
            }}>
              Show:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                             <button
                className={`btn ${filterType === 'all' ? '' : 'btn-secondary'}`}
                onClick={() => setFilterType('all')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  opacity: filterType === 'all' ? 1 : 0.7,
                  transition: 'all 0.3s ease',
                  transform: filterType === 'all' ? 'scale(1.05)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = filterType === 'all' ? 'scale(1.05)' : 'scale(1)';
                }}
              >
                All ({result.totalQuestions})
              </button>
              <button
                className={`btn ${filterType === 'correct' ? 'btn-success' : 'btn-secondary'}`}
                onClick={() => setFilterType('correct')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  opacity: filterType === 'correct' ? 1 : 0.7,
                  transition: 'all 0.3s ease',
                  transform: filterType === 'correct' ? 'scale(1.05)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = filterType === 'correct' ? 'scale(1.05)' : 'scale(1)';
                }}
              >
                Correct ({result.correctAnswers})
              </button>
              <button
                className={`btn ${filterType === 'incorrect' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => setFilterType('incorrect')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  opacity: filterType === 'incorrect' ? 1 : 0.7,
                  transition: 'all 0.3s ease',
                  transform: filterType === 'incorrect' ? 'scale(1.05)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = filterType === 'incorrect' ? 'scale(1.05)' : 'scale(1)';
                }}
              >
                Incorrect ({result.wrongAnswers})
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#6c757d',
          padding: '1rem',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '8px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          animation: 'fadeInDown 0.4s ease forwards'
        }}>
          Showing {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
        </div>

        {/* Questions List */}
        <div>
          {filteredQuestions.map((question, questionIndex) => {
            const userAnswer = result.userAnswers.find(ua => ua.questionSerial === question.serial)!;
            const isExpanded = expandedQuestions.has(question.serial);
            const correctOptions = question.options
              .filter(option => option.isCorrectAns)
              .map(option => option.optionValue);

            return (
              <div
                key={question.serial}
                style={{
                  border: `2px solid ${userAnswer.isCorrect ? '#28a745' : '#dc3545'}`,
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  background: userAnswer.isCorrect
                    ? 'rgba(40, 167, 69, 0.05)'
                    : 'rgba(220, 53, 69, 0.05)',
                  overflow: 'hidden',
                  animation: `slideInUp 0.6s ease forwards`,
                  animationDelay: `${questionIndex * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Question Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    cursor: 'pointer',
                    borderBottom: isExpanded ? '1px solid #e9ecef' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => toggleQuestionExpansion(question.serial)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      background: userAnswer.isCorrect ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '15px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      transition: 'transform 0.2s ease',
                      transform: isExpanded ? 'scale(1.05)' : 'scale(1)'
                    }}>
                      Q{question.serial} - {userAnswer.isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                    <div style={{
                      background: '#f8f9fa',
                      color: '#6c757d',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.75rem',
                      transition: 'all 0.2s ease',
                      transform: isExpanded ? 'scale(1.05)' : 'scale(1)'
                    }}>
                      {question.category}
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: '1.2rem', 
                    color: '#6c757d',
                    transition: 'transform 0.3s ease',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    +
                  </div>
                </div>

                {/* Question Details with smooth expansion */}
                <div
                  style={{
                    maxHeight: isExpanded ? '2000px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.5s ease-in-out, opacity 0.3s ease',
                    opacity: isExpanded ? 1 : 0
                  }}
                >
                  <div style={{ 
                    padding: '1rem',
                    animation: isExpanded ? 'fadeInDown 0.4s ease forwards' : 'none'
                  }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '500',
                      marginBottom: '1rem',
                      color: '#333',
                      animation: isExpanded ? 'slideInLeft 0.5s ease forwards' : 'none',
                      animationDelay: '0.1s'
                    }}>
                      {question.question}
                    </div>

                    {/* Your Answer */}
                    <div style={{ 
                      marginBottom: '1rem',
                      animation: isExpanded ? 'slideInLeft 0.5s ease forwards' : 'none',
                      animationDelay: '0.2s'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: '#495057'
                      }}>
                        Your Answer:
                      </div>
                      <div style={{
                        background: '#f8f9fa',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        color: userAnswer.isCorrect ? '#28a745' : '#dc3545',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        border: `2px solid transparent`,
                        borderColor: userAnswer.isCorrect ? '#28a745' : '#dc3545'
                      }}>
                        {userAnswer.selectedOptions.join(', ')}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div style={{ 
                      marginBottom: '1rem',
                      animation: isExpanded ? 'slideInLeft 0.5s ease forwards' : 'none',
                      animationDelay: '0.3s'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: '#495057'
                      }}>
                        Correct Answer:
                      </div>
                      <div style={{
                        background: 'rgba(40, 167, 69, 0.1)',
                        border: '2px solid #28a745',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        color: '#28a745',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}>
                        {correctOptions.join(', ')}
                      </div>
                    </div>

                    {/* All Options */}
                    <div style={{
                      animation: isExpanded ? 'slideInLeft 0.5s ease forwards' : 'none',
                      animationDelay: '0.4s'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: '#495057'
                      }}>
                        All Options:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              background: option.isCorrectAns
                                ? 'rgba(40, 167, 69, 0.1)'
                                : userAnswer.selectedOptions.includes(option.optionValue) && !option.isCorrectAns
                                ? 'rgba(220, 53, 69, 0.1)'
                                : '#f8f9fa',
                              border: `1px solid ${
                                option.isCorrectAns
                                  ? '#28a745'
                                  : userAnswer.selectedOptions.includes(option.optionValue) && !option.isCorrectAns
                                  ? '#dc3545'
                                  : '#e9ecef'
                              }`,
                              transition: 'all 0.3s ease',
                              animation: isExpanded ? `optionSlideIn 0.4s ease forwards` : 'none',
                              animationDelay: `${0.5 + (index * 0.1)}s`,
                              opacity: isExpanded ? 1 : 0,
                              transform: 'translateX(-20px)'
                            }}
                          >
                            {option.isCorrectAns && (
                              <span style={{
                                color: '#28a745',
                                fontWeight: 'bold',
                                marginRight: '0.5rem'
                              }}>✓</span>
                            )}
                            {userAnswer.selectedOptions.includes(option.optionValue) && !option.isCorrectAns && (
                              <span style={{
                                color: '#dc3545',
                                fontWeight: 'bold',
                                marginRight: '0.5rem'
                              }}>✗</span>
                            )}
                            {option.optionValue}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6c757d',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p>No questions match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamOverview; 