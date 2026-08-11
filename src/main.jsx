import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';
import { LocaleProvider } from './locales.jsx';

createRoot(document.getElementById('root')).render(<StrictMode><LocaleProvider><App /></LocaleProvider></StrictMode>);
