import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { offlineStorage, queryClient } from '@utils/query';
import { createRoot } from 'react-dom/client';
import App from '../../app/App';
import './index.css';

declare const VERSION: string;

const renderApp = async () => {
  persistQueryClient({
    queryClient,
    persister: offlineStorage,
    buster: VERSION,
  });
  const container = document.getElementById('app');

  const root = createRoot(container!);
  return root.render(<App />);
};
renderApp();
