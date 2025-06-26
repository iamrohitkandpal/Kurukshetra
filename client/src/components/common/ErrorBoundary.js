import React from 'react';
import PropTypes from 'prop-types';

// Change to named export
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error caught in boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-4 m-4">
          <h2 className="mb-4">💥 Something went wrong</h2>
          <pre className="bg-light p-4 rounded">
            {this.state.error?.message}
          </pre>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};