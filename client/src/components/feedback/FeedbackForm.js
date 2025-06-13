import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    content: '',
    rating: 5
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { content, rating } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // A03: XSS vulnerability - Content not sanitized
      await axios.post('/api/feedback', formData);
      setSuccess('Feedback submitted successfully');
      setFormData({ content: '', rating: 5 });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <div className="container">
      <h2>Submit Feedback</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Your Feedback</label>
          <textarea
            name="content"
            className="form-control"
            rows="4"
            value={content}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Rating</label>
          <select
            name="rating"
            className="form-select"
            value={rating}
            onChange={onChange}
          >
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-primary">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;