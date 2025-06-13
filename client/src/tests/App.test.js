import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import ProductList from '../components/products/ProductList';
import FileUpload from '../components/files/FileUpload';
import FeedbackForm from '../components/feedback/FeedbackForm';
import AuthContext from '../context/AuthContext';

// Mock AuthContext
const mockAuthContext = {
  user: null,
  token: null,
  setUser: jest.fn(),
  setToken: jest.fn()
};

// Mock axios
jest.mock('axios');

describe('React Components Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Landing page renders correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Welcome to Kurukshetra/i)).toBeInTheDocument();
  });

  // Authentication Tests
  describe('Authentication Flow', () => {
    test('Login form submission', async () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByText(/login/i));

      await waitFor(() => {
        expect(mockAuthContext.setToken).toHaveBeenCalled();
      });
    });

    test('Register form submission', async () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <BrowserRouter>
            <Register />
          </BrowserRouter>
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'newuser' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'new@user.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByText(/register/i));

      await waitFor(() => {
        expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
      });
    });
  });

  // Component Tests
  describe('Component Functionality', () => {
    test('Products list displays correctly', async () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <BrowserRouter>
            <ProductList />
          </BrowserRouter>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Product Catalog/i)).toBeInTheDocument();
      });
    });

    test('File upload component', async () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <BrowserRouter>
            <FileUpload />
          </BrowserRouter>
        </AuthContext.Provider>
      );

      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      const input = screen.getByLabelText(/choose file/i);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/upload/i)).not.toBeDisabled();
      });
    });
  });

  // Vulnerability Tests
  describe('Security Features', () => {
    test('XSS vulnerability in feedback form', async () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <BrowserRouter>
            <FeedbackForm />
          </BrowserRouter>
        </AuthContext.Provider>
      );

      const xssPayload = '<script>alert("XSS")</script>';
      fireEvent.change(screen.getByLabelText(/feedback/i), {
        target: { value: xssPayload },
      });
      fireEvent.click(screen.getByText(/submit/i));

      await waitFor(() => {
        expect(screen.getByText(/feedback submitted/i)).toBeInTheDocument();
      });
    });
  });
});