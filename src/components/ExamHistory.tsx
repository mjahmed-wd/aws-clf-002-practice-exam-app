import React from 'react';
import { ExamResult } from '../types/quiz';
import { formatTime } from '../utils/quiz';

interface ExamHistoryProps {
  history: ExamResult[];
  onBack: () => void;
  onViewResult: (result: ExamResult) => void;
}

const ExamHistory: React.FC<ExamHistoryProps> = ({ history, onBack, onViewResult }) => {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#28a745'; // Green
    if (percentage >= 70) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const getScoreBadge = (correctAnswers: number, totalQuestions: number) => {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= 70;
    
    return {
      percentage,
      passed,
      color: getScoreColor(percentage)
    };
  };

  if (history.length === 0) {
    return (
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>
          Exam History
        </h2>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No exam history found</p>
          <p>Take your first exam to see results here!</p>
          <button className="btn" onClick={onBack} style={{ marginTop: '2rem' }}>
            Start New Exam
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
            Exam History
          </h2>
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Setup
          </button>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'center', color: '#6c757d' }}>
          <p>Total exams taken: <strong>{history.length}</strong></p>
        </div>

        {/* History Statistics */}
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
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
              {history.filter(exam => {
                const percentage = Math.round((exam.correctAnswers / exam.totalQuestions) * 100);
                return percentage >= 70;
              }).length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Passed
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
              {history.filter(exam => {
                const percentage = Math.round((exam.correctAnswers / exam.totalQuestions) * 100);
                return percentage < 70;
              }).length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Failed
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
              {Math.round(
                history.reduce((acc, exam) => {
                  return acc + Math.round((exam.correctAnswers / exam.totalQuestions) * 100);
                }, 0) / history.length
              )}%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Average
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6c757d' }}>
              {Math.max(...history.map(exam => Math.round((exam.correctAnswers / exam.totalQuestions) * 100)))}%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Best Score
            </div>
          </div>
        </div>

        {/* History List */}
        <div>
          {history.map((exam, index) => {
            const badge = getScoreBadge(exam.correctAnswers, exam.totalQuestions);
            
            return (
              <div key={exam.id} className="history-item">
                <div className="history-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      background: badge.color,
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      {badge.percentage}% {badge.passed ? '✓' : '✗'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                        Questions {exam.questionsRange.start} - {exam.questionsRange.end}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                        {exam.correctAnswers}/{exam.totalQuestions} correct • {formatTime(exam.timeTaken)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="history-date">
                      {exam.completedAt.toLocaleDateString()}
                    </div>
                    <div className="history-date">
                      {exam.completedAt.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '1rem'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    Exam #{history.length - index} • ID: {exam.id.split('_')[2]}
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => onViewResult(exam)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    View Details & Overview
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExamHistory; 