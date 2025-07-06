import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExamResult, QuizQuestion } from '../types/quiz';
import { formatTime } from '../utils/quiz';

interface ExamResultsProps {
  result: ExamResult;
  questions: QuizQuestion[];
  onBackToSetup: () => void;
  onRetakeExam: () => void;
  onViewHistory: () => void;
  onViewOverview: () => void;
}

const ExamResults: React.FC<ExamResultsProps> = ({
  result,
  questions,
  onBackToSetup,
  onRetakeExam,
  onViewHistory,
  onViewOverview
}) => {
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showCharts, setShowCharts] = useState<boolean>(true);
  
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const passed = percentage >= 70; // AWS Cloud Practitioner passing score is typically 70%
  
  // Calculate detailed stats
  const incorrectAnswers = result.incorrectAnswers || result.userAnswers.filter(answer => !answer.isCorrect).length;
  const unattendedQuestions = result.unattendedQuestions || (result.totalQuestions - result.userAnswers.length);

  const getScoreColor = () => {
    if (percentage >= 80) return '#28a745'; // Green
    if (percentage >= 70) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const toggleReview = () => {
    setShowReview(!showReview);
  };

  // Chart data
  const pieData = [
    { name: 'Correct', value: result.correctAnswers, color: '#28a745' },
    { name: 'Incorrect', value: incorrectAnswers, color: '#dc3545' },
    { name: 'Unattended', value: unattendedQuestions, color: '#6c757d' }
  ].filter(item => item.value > 0);

  // Category performance data
  const categoryData = React.useMemo(() => {
    const categoryStats = new Map();
    
    questions.forEach(question => {
      const userAnswer = result.userAnswers.find(ua => ua.questionSerial === question.serial);
      const category = question.category;
      
      if (!categoryStats.has(category)) {
        categoryStats.set(category, {
          category: category.replace(' and ', ' & '),
          total: 0,
          correct: 0,
          incorrect: 0,
          unattended: 0
        });
      }
      
      const stats = categoryStats.get(category);
      stats.total++;
      
      if (userAnswer) {
        if (userAnswer.isCorrect) {
          stats.correct++;
        } else {
          stats.incorrect++;
        }
      } else {
        stats.unattended++;
      }
    });
    
    return Array.from(categoryStats.values());
  }, [result, questions]);

  const COLORS = ['#28a745', '#dc3545', '#6c757d'];

  return (
    <div>
      {/* Results Summary */}
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>
          Exam Results
        </h2>

        <div className="results-summary">
          <div className="result-item">
            <div className="result-number" style={{ color: getScoreColor() }}>
              {percentage}%
            </div>
            <div className="result-label">Score</div>
          </div>

          <div className={`result-item ${passed ? 'correct' : 'incorrect'}`}>
            <div className="result-number">
              {passed ? '✓' : '✗'}
            </div>
            <div className="result-label">
              {passed ? 'PASSED' : 'FAILED'}
            </div>
          </div>

          <div className="result-item correct">
            <div className="result-number">{result.correctAnswers}</div>
            <div className="result-label">Correct</div>
          </div>

          <div className="result-item incorrect">
            <div className="result-number">{incorrectAnswers}</div>
            <div className="result-label">Incorrect</div>
          </div>

          {unattendedQuestions > 0 && (
            <div className="result-item" style={{ background: '#f8f9fa', color: '#6c757d' }}>
              <div className="result-number">{unattendedQuestions}</div>
              <div className="result-label">Unattended</div>
            </div>
          )}

          <div className="result-item">
            <div className="result-number">{result.totalQuestions}</div>
            <div className="result-label">Total</div>
          </div>

          <div className="result-item">
            <div className="result-number" style={{ fontSize: '1.2rem' }}>
              {formatTime(result.timeTaken)}
            </div>
            <div className="result-label">Time Taken</div>
          </div>
        </div>

        {/* Exam Details */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0.5rem 0', color: '#6c757d' }}>
            <strong>Questions Range:</strong> {result.questionsRange.start} - {result.questionsRange.end}
          </p>
          <p style={{ margin: '0.5rem 0', color: '#6c757d' }}>
            <strong>Completed on:</strong> {result.completedAt.toLocaleDateString()} at {result.completedAt.toLocaleTimeString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button className="btn" onClick={onRetakeExam}>
            Retake Exam
          </button>
          <button className="btn btn-warning" onClick={onViewOverview}>
            Detailed Overview
          </button>
          <button className="btn btn-success" onClick={() => setShowCharts(!showCharts)}>
            {showCharts ? 'Hide Charts' : 'Show Charts'}
          </button>
          <button className="btn btn-secondary" onClick={toggleReview}>
            {showReview ? 'Hide Review' : 'Review Answers'}
          </button>
          <button className="btn btn-secondary" onClick={onViewHistory}>
            View All Results
          </button>
          <button className="btn btn-secondary" onClick={onBackToSetup}>
            New Exam
          </button>
        </div>
      </div>

      {/* Interactive Charts */}
      {showCharts && (
        <div className="card">
          <h3 style={{ marginBottom: '2rem', color: '#2c3e50', textAlign: 'center' }}>
            📊 Performance Analytics
          </h3>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Overall Performance Pie Chart */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Overall Performance</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent = 0 }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Performance Bar Chart */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Performance by Category</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'correct' ? 'Correct' : name === 'incorrect' ? 'Incorrect' : 'Unattended']}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="correct" stackId="a" fill="#28a745" name="Correct" />
                  <Bar dataKey="incorrect" stackId="a" fill="#dc3545" name="Incorrect" />
                  <Bar dataKey="unattended" stackId="a" fill="#6c757d" name="Unattended" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Summary */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '2rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <h4 style={{ marginBottom: '1rem', color: 'white' }}>📈 Quick Stats</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '1rem' 
            }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{percentage}%</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Overall Score</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{result.correctAnswers}/{result.totalQuestions}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Questions Correct</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatTime(result.timeTaken)}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Time Taken</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {passed ? '🎉' : '📚'}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                  {passed ? 'Passed!' : 'Keep Learning'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Answer Review */}
      {showReview && (
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
            Answer Review
          </h3>

          {/* Show answered questions */}
          {result.userAnswers.map((userAnswer) => {
            const question = questions.find(q => q.serial === userAnswer.questionSerial);
            if (!question) return null;

            const correctOptions = question.options
              .filter(option => option.isCorrectAns)
              .map(option => option.optionValue);

            return (
              <div 
                key={userAnswer.questionSerial}
                style={{
                  border: `2px solid ${userAnswer.isCorrect ? '#28a745' : '#dc3545'}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  background: userAnswer.isCorrect 
                    ? 'rgba(40, 167, 69, 0.05)' 
                    : 'rgba(220, 53, 69, 0.05)'
                }}
              >
                {/* Question Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <div style={{ 
                    background: userAnswer.isCorrect ? '#28a745' : '#dc3545',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '15px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    Q{userAnswer.questionSerial} - {userAnswer.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                  <div style={{ 
                    background: '#f8f9fa',
                    color: '#6c757d',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '15px',
                    fontSize: '0.75rem'
                  }}>
                    {question.category}
                  </div>
                </div>

                {/* Question Text */}
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  marginBottom: '1rem',
                  color: '#333'
                }}>
                  {question.question}
                </div>

                {/* Your Answer */}
                <div style={{ marginBottom: '1rem' }}>
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
                    fontWeight: '500'
                  }}>
                    {userAnswer.selectedOptions.join(', ')}
                  </div>
                </div>

                {/* Correct Answer (if incorrect) */}
                {!userAnswer.isCorrect && (
                  <div>
                    <div style={{ 
                      fontWeight: '600', 
                      marginBottom: '0.5rem',
                      color: '#495057'
                    }}>
                      Correct Answer:
                    </div>
                    <div style={{
                      background: 'rgba(40, 167, 69, 0.1)',
                      border: '1px solid #28a745',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      color: '#28a745',
                      fontWeight: '500'
                    }}>
                      {correctOptions.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Show unattended questions */}
          {unattendedQuestions > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#6c757d', marginBottom: '1rem' }}>
                ⚠️ Unattended Questions ({unattendedQuestions})
              </h4>
              {questions
                .filter(question => !result.userAnswers.find(ua => ua.questionSerial === question.serial))
                .map((question) => {
                  const correctOptions = question.options
                    .filter(option => option.isCorrectAns)
                    .map(option => option.optionValue);

                  return (
                    <div 
                      key={question.serial}
                      style={{
                        border: '2px solid #6c757d',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        background: 'rgba(108, 117, 125, 0.05)'
                      }}
                    >
                      {/* Question Header */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <div style={{ 
                          background: '#6c757d',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          Q{question.serial} - Unattended
                        </div>
                        <div style={{ 
                          background: '#f8f9fa',
                          color: '#6c757d',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          fontSize: '0.75rem'
                        }}>
                          {question.category}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: '500', 
                        marginBottom: '1rem',
                        color: '#333'
                      }}>
                        {question.question}
                      </div>

                      {/* Correct Answer */}
                      <div>
                        <div style={{ 
                          fontWeight: '600', 
                          marginBottom: '0.5rem',
                          color: '#495057'
                        }}>
                          Correct Answer:
                        </div>
                        <div style={{
                          background: 'rgba(40, 167, 69, 0.1)',
                          border: '1px solid #28a745',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          color: '#28a745',
                          fontWeight: '500'
                        }}>
                          {correctOptions.join(', ')}
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>
      )}

      {/* Performance Tips */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
          Performance Tips
        </h3>
        
        {passed ? (
          <div style={{ color: '#28a745' }}>
            <p><strong>Congratulations!</strong> You passed the exam with a score of {percentage}%.</p>
            <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
              <li>Keep practicing to maintain your knowledge</li>
              <li>Review any questions you got wrong to strengthen weak areas</li>
              <li>Consider taking the actual AWS Cloud Practitioner exam</li>
            </ul>
          </div>
        ) : (
          <div style={{ color: '#dc3545' }}>
            <p><strong>Keep studying!</strong> You need at least 70% to pass.</p>
            <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
              <li>Review the questions you missed in the answer review above</li>
              <li>Focus on the categories where you struggled most</li>
              <li>Practice more questions in your weak areas</li>
              <li>Use the mistakes review feature to track your progress</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResults; 