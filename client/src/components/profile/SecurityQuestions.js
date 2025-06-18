import React, { useState } from 'react';
import axios from 'axios';

const SecurityQuestions = () => {
  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: ''
  });

  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/profile/security-questions', answers);
      setMessage('Security questions updated successfully');
    } catch (err) {
      setMessage('Error updating security questions');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">Security Questions</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Question 1</label>
            <input
              type="text"
              className="form-control"
              value={answers.question1}
              onChange={(e) => setAnswers({ ...answers, question1: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Question 2</label>
            <input
              type="text"
              className="form-control"
              value={answers.question2}
              onChange={(e) => setAnswers({ ...answers, question2: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Question 3</label>
            <input
              type="text"
              className="form-control"
              value={answers.question3}
              onChange={(e) => setAnswers({ ...answers, question3: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Save Answers
          </button>
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
      </div>
    </div>
  );
};

export default SecurityQuestions;