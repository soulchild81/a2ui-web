import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@a2ui/react/styles';
import './a2ui/cadenza-basic.css';
import './styles.css';
import {App} from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

