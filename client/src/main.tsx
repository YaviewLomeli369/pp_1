import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Performance optimizations
const rootElement = document.getElementById('root')!;

// Add loading indicator while app initializes
rootElement.innerHTML = `
  <div style="
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: Inter, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  ">
    <div style="text-align: center;">
      <div style="
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      "></div>
      <p>Cargando...</p>
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </div>
`;

// Render app with performance optimizations
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);