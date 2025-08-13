import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { StoryProvider } from './ui/story/StoryStore';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <StoryProvider>
      <App />
    </StoryProvider>
  </React.StrictMode>
);


