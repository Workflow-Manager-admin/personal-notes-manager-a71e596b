import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import FallbackErrorUI from './FallbackErrorUI';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={FallbackErrorUI}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
