import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { loadUiButton } from './load-ui-button';
import './styles.css';

loadUiButton()
  .then(() => {
    const root = document.getElementById('root');
    if (!root) {
      throw new Error('missing #root');
    }

    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((error) => console.error(error));
