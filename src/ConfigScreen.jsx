import React, { useState, useEffect } from 'react';
import './ConfigScreen.css';
import { FaEdit, FaCheck, FaTrash, FaRandom, FaSlidersH, FaArrowLeft } from 'react-icons/fa';

function ConfigScreen({ generatedMode = "Quiz Challenge", generatedQuestions = [], onStartGame, onBack }) {
  const [questions, setQuestions] = useState(generatedQuestions);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(generatedQuestions.length);

  // Animation state
  const [show, setShow] = useState(false);

  useEffect(() => {
    setQuestionCount(Math.min(questionCount, questions.length));
    const timer = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(timer);
  }, [questions.length]);

  // Edit a question (simulated)
  const handleEdit = (id) => {
    alert(`Editing question ID: ${id}. In a real app, this would open a modal.`);
  };

  // Remove a question
  const handleRemove = (id) => {
    const newQuestions = questions.filter(q => q.id !== id);
    setQuestions(newQuestions);
    if (questionCount > newQuestions.length) setQuestionCount(newQuestions.length);
  };

  // Confirm settings and start the game
  const handleConfirm = () => {
    if (questions.length === 0 || questionCount === 0) {
      alert("Cannot start game: No questions selected.");
      return;
    }

    const finalQuestions = questions.slice(0, questionCount);

    if (onStartGame) {
      onStartGame({ 
        mode: generatedMode, 
        count: finalQuestions.length, 
        diff: difficulty,
        finalQuestions: finalQuestions
      });
    }
  };

  // Get question type
  const getQuestionType = (q) => q.options && q.options.length > 0 ? "Multiple Choice" : "Open Answer";

  return (
    <div className={`config-wrapper ${show ? 'show' : ''}`}>
      <div className="card-config">
        {/* Header */}
        <header className="config-header">
          <FaSlidersH className="config-icon" />
          <h2>Reviewer Configuration: <span className="mode-highlight">{generatedMode}</span></h2>
          <p>Customize your generated questions and game settings.</p>
        </header>

        <div className="config-body">
          {/* Settings Panel */}
          <div className="settings-panel">
            {onBack && (
              <button className="back-btn" onClick={onBack}>
                <FaArrowLeft /> Back
              </button>
            )}
            <h3><FaRandom /> Game Settings</h3>
            
            <div className="setting-group">
              <label>Difficulty Level</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Total Questions</label>
              <input 
                type="number" 
                min="1" 
                max={questions.length} 
                value={questionCount} 
                onChange={(e) => {
                  let value = parseInt(e.target.value);
                  if (isNaN(value) || value < 1) value = 1;
                  if (value > questions.length) value = questions.length;
                  setQuestionCount(value);
                }}
              />
              <small>Max available: {questions.length}</small>
            </div>

            <button className="confirm-btn" onClick={handleConfirm}>
              <FaCheck /> CONFIRM & START GAME
            </button>
          </div>

          {/* Question List Panel */}
          <div className="question-list-panel">
            <h3>Generated Questions ({questions.length})</h3>
            <ul className="question-list">
              {questions.map(q => (
                <li key={q.id} className="question-item">
                  <span className="q-type">[{getQuestionType(q)}]</span>
                  <span className="q-text">{q.question || q.text}</span>
                  <div className="q-actions">
                    <button onClick={() => handleEdit(q.id)} title="Edit Question" className="edit-btn"><FaEdit /></button>
                    <button onClick={() => handleRemove(q.id)} title="Remove Question" className="delete-btn"><FaTrash /></button>
                  </div>
                </li>
              ))}
              {questions.length === 0 && (
                <li className="no-questions">No questions available. Please try regenerating with a different file.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigScreen;
