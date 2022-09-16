/* eslint-disable import/no-import-module-exports */
import { createRoot } from 'react-dom/client';
import App from '../../app/App';
import './index.css';
// import './index.css';

const container = document.getElementById('app-container');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);

// eslint-disable-next-line no-undef
if (module.hot) module.hot.accept();
