import './index.css'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './src/App.tsx'
import { startTransition } from 'react';

const rootElement = document.getElementById('root');

if (rootElement) {
  startTransition(() => {
    hydrateRoot(
      rootElement,
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
}

