import { createRoot } from 'react-dom/client';
import App from './App';

const el = document.getElementById('app');
if (el) {
  createRoot(el).render(<App />);
}
