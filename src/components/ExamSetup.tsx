import React, { useState } from 'react';
import { ExamSettings, ExamMode } from '../types/quiz';

interface ExamSetupProps {
  totalQuestions: number;
  onStartExam: (settings: ExamSettings) => void;
  onViewHistory: () => void;
  onViewMistakes: () => void;
  hasHistory: boolean;
  hasMistakes: boolean;
}

const ExamSetup: React.FC<ExamSetupProps> = ({
  totalQuestions,
  onStartExam,
  onViewHistory,
  onViewMistakes,
  hasHistory,
  hasMistakes
}) => {
  const [startQuestion, setStartQuestion] = useState<number>(1);
  const [endQuestion, setEndQuestion] = useState<number>(100);
  const [examMode, setExamMode] = useState<ExamMode>('practice');
  const [errors, setErrors] = useState<string[]>([]);

  const validateSettings = (): boolean => {
    const newErrors: string[] = [];

    if (startQuestion < 1 || startQuestion > totalQuestions) {
      newErrors.push(`Start question must be between 1 and ${totalQuestions}`);
    }

    if (endQuestion < 1 || endQuestion > totalQuestions) {
      newErrors.push(`End question must be between 1 and ${totalQuestions}`);
    }

    if (startQuestion > endQuestion) {
      newErrors.push('Start question cannot be greater than end question');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleStartExam = () => {
    if (validateSettings()) {
      onStartExam({ startQuestion, endQuestion, mode: examMode });
    }
  };

  const handleQuickStart = (start: number, end: number) => {
    setStartQuestion(start);
    setEndQuestion(end);
    onStartExam({ startQuestion: start, endQuestion: end, mode: examMode });
  };

  return (
    <div className="card">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>
        AWS Cloud Practitioner Exam Setup
      </h2>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '1rem' }}>
          Total Questions Available: <strong>{totalQuestions}</strong>
        </p>
      </div>

      {/* Exam Mode Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Exam Mode</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div
            style={{
              border: `3px solid ${examMode === 'practice' ? '#667eea' : '#e9ecef'}`,
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: examMode === 'practice' ? 'rgba(102, 126, 234, 0.1)' : '#f8f9fa'
            }}
            onClick={() => setExamMode('practice')}
          >
            <div style={{ 
              fontSize: '1.5rem', 
              marginBottom: '0.5rem',
              color: examMode === 'practice' ? '#667eea' : '#6c757d'
            }}>
              📚
            </div>
            <h4 style={{ 
              margin: '0 0 0.5rem 0',
              color: examMode === 'practice' ? '#667eea' : '#2c3e50'
            }}>
              Practice Mode
            </h4>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem',
              color: '#6c757d'
            }}>
              See all questions in sidebar, immediate feedback, pause anytime
            </p>
          </div>
          
          <div
            style={{
              border: `3px solid ${examMode === 'exam' ? '#667eea' : '#e9ecef'}`,
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: examMode === 'exam' ? 'rgba(102, 126, 234, 0.1)' : '#f8f9fa'
            }}
            onClick={() => setExamMode('exam')}
          >
            <div style={{ 
              fontSize: '1.5rem', 
              marginBottom: '0.5rem',
              color: examMode === 'exam' ? '#667eea' : '#6c757d'
            }}>
              🎯
            </div>
            <h4 style={{ 
              margin: '0 0 0.5rem 0',
              color: examMode === 'exam' ? '#667eea' : '#2c3e50'
            }}>
              Exam Mode
            </h4>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem',
              color: '#6c757d'
            }}>
              Real exam experience, no sidebar, focused testing
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Options */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Quick Start</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button
            className="btn btn-success"
            onClick={() => handleQuickStart(1, 50)}
          >
            Practice Set 1 (1-50)
          </button>
          <button
            className="btn btn-success"
            onClick={() => handleQuickStart(51, 100)}
          >
            Practice Set 2 (51-100)
          </button>
          <button
            className="btn btn-success"
            onClick={() => handleQuickStart(101, 150)}
          >
            Practice Set 3 (101-150)
          </button>
          <button
            className="btn btn-warning"
            onClick={() => handleQuickStart(1, 100)}
          >
            Full Practice (1-100)
          </button>
        </div>
      </div>

      {/* Custom Range */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Custom Range</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label htmlFor="startQuestion">Start Question:</label>
            <input
              type="number"
              id="startQuestion"
              className="form-control"
              value={startQuestion}
              onChange={(e) => setStartQuestion(Number(e.target.value))}
              min={1}
              max={totalQuestions}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endQuestion">End Question:</label>
            <input
              type="number"
              id="endQuestion"
              className="form-control"
              value={endQuestion}
              onChange={(e) => setEndQuestion(Number(e.target.value))}
              min={1}
              max={totalQuestions}
            />
          </div>
        </div>

        {errors.length > 0 && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem' 
          }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ color: '#6c757d' }}>
            Questions to attempt: <strong>{Math.max(0, endQuestion - startQuestion + 1)}</strong>
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            className="btn"
            onClick={handleStartExam}
            style={{ minWidth: '200px' }}
          >
            Start Custom Exam
          </button>
        </div>
      </div>

      {/* History and Mistakes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem', 
        paddingTop: '2rem', 
        borderTop: '1px solid #e9ecef' 
      }}>
        <button
          className="btn btn-secondary"
          onClick={onViewHistory}
          disabled={!hasHistory}
          style={{ opacity: hasHistory ? 1 : 0.6 }}
        >
          View Exam History
        </button>

        <button
          className="btn btn-danger"
          onClick={onViewMistakes}
          disabled={!hasMistakes}
          style={{ opacity: hasMistakes ? 1 : 0.6 }}
        >
          Review Mistakes
        </button>
      </div>
    </div>
  );
};

export default ExamSetup; 