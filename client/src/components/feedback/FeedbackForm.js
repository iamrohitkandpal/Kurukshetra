import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    content: '',
    rating: 5
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ content: false });

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
    <div className="container py-4">
      <div className="card glass-card">
        <div className="card-header">
          <h2 className="mb-0">Submit Feedback</h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}
          
          <form onSubmit={onSubmit} className="needs-validation">
            <div className="mb-4">
              <label className="form-label fw-semibold">Your Feedback</label>
              <textarea
                name="content"
                className={`form-control ${touched.content && !content ? 'is-invalid' : ''}`}
                rows="4"
                value={content}
                onChange={onChange}
                onBlur={() => setTouched({ ...touched, content: true })}
                placeholder="Share your thoughts..."
                required
              />
              {touched.content && !content && (
                <div className="invalid-feedback">
                  Please provide your feedback
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-semibold">Rating</label>
              <div className="rating-select">
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
              <small className="text-muted">Select a rating from 1 to 5</small>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary px-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;