import { createRoot } from 'react-dom/client';
import App from '../../app/App';
import './index.css';

const container = document.getElementById('app-container');
const root = createRoot(container);
root.render(<App />);
