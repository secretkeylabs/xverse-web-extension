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

  // We need to do this after load in order for the extension popup to have the correct height on first load
  container!.style.maxHeight = '100vh';

  const root = createRoot(container!);
  return root.render(<App />);
};
renderApp();
