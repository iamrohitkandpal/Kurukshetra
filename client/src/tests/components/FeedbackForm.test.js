import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import FeedbackForm from '../../components/feedback/FeedbackForm';

jest.mock('axios');

describe('FeedbackForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders feedback form', () => {
    render(<FeedbackForm />);

    expect(screen.getByLabelText(/your feedback/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
  });

  test('handles successful feedback submission', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<FeedbackForm />);

    fireEvent.change(screen.getByLabelText(/your feedback/i), {
      target: { value: 'Great application!' }
    });
    fireEvent.change(screen.getByLabelText(/rating/i), {
      target: { value: '5' }
    });
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }));

    await waitFor(() => {
      expect(screen.getByText(/feedback submitted successfully/i)).toBeInTheDocument();
    });
  });

  test('handles feedback submission failure', async () => {
    const errorMessage = 'Failed to submit feedback';
    axios.post.mockRejectedValueOnce({ 
      response: { data: { error: errorMessage } } 
    });

    render(<FeedbackForm />);

    fireEvent.change(screen.getByLabelText(/your feedback/i), {
      target: { value: 'Test feedback' }
    });
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
