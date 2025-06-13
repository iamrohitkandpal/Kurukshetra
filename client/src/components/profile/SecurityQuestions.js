import React, { useState } from 'react';
import axios from 'axios';

const SecurityQuestions = ({ questions }) => {
  const [newQuestions, setNewQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleQuestionChange = (index, field, value) => {
    const updated = [...newQuestions];
    updated[index][field] = value;
    setNewQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/security-questions', { questions: newQuestions });
      setSuccess('Security questions updated');
      setNewQuestions([{ question: '', answer: '' }, { question: '', answer: '' }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update security questions');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Security Questions</h3>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {newQuestions.map((q, index) => (
            <div key={index} className="mb-4">
              <h4>Question {index + 1}</h4>
              <div className="mb-3">
                <label className="form-label">Question</label>
                <input
                  type="text"
                  className="form-control"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Answer</label>
                <input
                  type="text"
                  className="form-control"
                  value={q.answer}
                  onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
          <button type="submit" className="btn btn-primary">
            Save Security Questions
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityQuestions;