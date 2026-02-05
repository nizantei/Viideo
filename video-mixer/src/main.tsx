import React from 'react';
import ReactDOM from 'react-dom/client';
import { MixerProvider } from './context/MixerContext';
import { UIConfigProvider } from './systems';
import App from './components/App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MixerProvider>
      <UIConfigProvider>
        <App />
      </UIConfigProvider>
    </MixerProvider>
  </React.StrictMode>
);
