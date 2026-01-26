import React from 'react';
import ReactDOM from 'react-dom/client';
import { MixerProvider } from './context/MixerContext';
import App from './components/App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MixerProvider>
      <App />
    </MixerProvider>
  </React.StrictMode>
);
