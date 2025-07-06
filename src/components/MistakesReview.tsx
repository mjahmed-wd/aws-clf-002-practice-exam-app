import React, { useState } from 'react';
import { QuestionMistake, QuizQuestion } from '../types/quiz';

interface MistakesReviewProps {
  mistakes: QuestionMistake[];
  allQuestions: QuizQuestion[];
  onBack: () => void;
  onPracticeQuestion: (questionSerial: number) => void;
}

const MistakesReview: React.FC<MistakesReviewProps> = ({
  mistakes,
  onBack,
  onPracticeQuestion
}) => {
  const [sortBy, setSortBy] = useState<'mistakeCount' | 'lastMistakeDate'>('mistakeCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get unique categories from mistakes
  const categories = Array.from(new Set(mistakes.map(mistake => mistake.question.category)));

  // Filter and sort mistakes
  const filteredAndSortedMistakes = mistakes
    .filter(mistake => filterCategory === 'all' || mistake.question.category === filterCategory)
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'mistakeCount') {
        comparison = a.mistakeCount - b.mistakeCount;
      } else {
        comparison = a.lastMistakeDate.getTime() - b.lastMistakeDate.getTime();
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleSort = (newSortBy: 'mistakeCount' | 'lastMistakeDate') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (mistakes.length === 0) {
    return (
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>
          Mistakes Review
        </h2>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No mistakes recorded yet</p>
          <p>Great job! You haven't made any mistakes so far.</p>
          <p>Keep practicing to maintain your performance!</p>
          <button className="btn" onClick={onBack} style={{ marginTop: '2rem' }}>
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>
            Mistakes Review
          </h2>
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Setup
          </button>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'center', color: '#6c757d' }}>
          <p>Total questions with mistakes: <strong>{mistakes.length}</strong></p>
        </div>

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
              {mistakes.reduce((total, mistake) => total + mistake.mistakeCount, 0)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Mistakes
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
              {Math.max(...mistakes.map(mistake => mistake.mistakeCount))}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Most Mistakes
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6c757d' }}>
              {Math.round(mistakes.reduce((total, mistake) => total + mistake.mistakeCount, 0) / mistakes.length * 10) / 10}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Avg per Question
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
              {categories.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Categories
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '1rem', 
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px'
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
              Filter by Category:
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                background: 'white',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: '#495057'
            }}>
              Sort by:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn ${sortBy === 'mistakeCount' ? '' : 'btn-secondary'}`}
                onClick={() => handleSort('mistakeCount')}
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.875rem',
                  opacity: sortBy === 'mistakeCount' ? 1 : 0.7
                }}
              >
                Mistake Count {sortBy === 'mistakeCount' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                className={`btn ${sortBy === 'lastMistakeDate' ? '' : 'btn-secondary'}`}
                onClick={() => handleSort('lastMistakeDate')}
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.875rem',
                  opacity: sortBy === 'lastMistakeDate' ? 1 : 0.7
                }}
              >
                Recent {sortBy === 'lastMistakeDate' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
        </div>

        {/* Mistakes List */}
        <div>
          {filteredAndSortedMistakes.map((mistake) => (
            <div key={mistake.questionSerial} className="mistake-item">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      background: '#dc3545',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      Q{mistake.questionSerial}
                    </div>
                    <div className="mistake-count">
                      {mistake.mistakeCount} mistake{mistake.mistakeCount !== 1 ? 's' : ''}
                    </div>
                    <div style={{
                      background: '#f8f9fa',
                      color: '#6c757d',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.75rem'
                    }}>
                      {mistake.question.category}
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    marginBottom: '0.5rem',
                    color: '#333'
                  }}>
                    {mistake.question.question}
                  </div>

                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6c757d'
                  }}>
                    Last mistake: {mistake.lastMistakeDate.toLocaleDateString()} at {mistake.lastMistakeDate.toLocaleTimeString()}
                  </div>

                  {/* Correct Answer Preview */}
                  <div style={{ 
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(40, 167, 69, 0.1)',
                    border: '1px solid #28a745',
                    borderRadius: '6px'
                  }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#28a745',
                      marginBottom: '0.25rem'
                    }}>
                      Correct Answer{mistake.question.options.filter(o => o.isCorrectAns).length > 1 ? 's' : ''}:
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#28a745'
                    }}>
                      {mistake.question.options
                        .filter(option => option.isCorrectAns)
                        .map(option => option.optionValue)
                        .join(', ')
                      }
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-warning"
                  onClick={() => onPracticeQuestion(mistake.questionSerial)}
                  style={{ 
                    marginLeft: '1rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Practice Again
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedMistakes.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#6c757d',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p>No mistakes found for the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MistakesReview; 