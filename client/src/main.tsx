import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Theme initialization
import { apiRequest } from './lib/queryClient';

// Load and apply theme on startup
const initializeTheme = async () => {
  try {
    const config = await apiRequest('/api/config');
    if (config?.config?.appearance) {
      const appearance = config.config.appearance;
      const root = document.documentElement;

      // Apply theme variables
      Object.entries(appearance).forEach(([key, value]) => {
        if (typeof value === 'string') {
          switch (key) {
            case 'primaryColor':
              root.style.setProperty('--color-primary', value);
              break;
            case 'secondaryColor':
              root.style.setProperty('--color-secondary', value);
              break;
            case 'accentColor':
              root.style.setProperty('--color-accent', value);
              break;
            case 'backgroundColor':
              root.style.setProperty('--color-background', value);
              break;
            case 'textColor':
              root.style.setProperty('--color-text', value);
              break;
            case 'linkColor':
              root.style.setProperty('--color-link', value);
              break;
            case 'fontFamily':
              root.style.setProperty('--font-family', value);
              break;
            case 'headingFont':
              root.style.setProperty('--font-heading', value);
              break;
          }
        }
      });
    }
  } catch (error) {
    console.warn('Could not load theme configuration:', error);
  }
};

// Initialize theme then render app
initializeTheme().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});