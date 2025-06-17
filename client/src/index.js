import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// A06:2021 - Vulnerable and Outdated Components
// Intentionally using unsafe rendering
root.render(
  <App />
);