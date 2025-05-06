/* eslint-disable no-console */
import WalletCloseGuard from '@components/guards/walletCloseGuard';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { offlineStorage, queryClient } from '@utils/query';
import { initI18n } from 'locales';
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

  await initI18n();

  const container = document.getElementById('app');
  const root = createRoot(container!);
  return root.render(
    <WalletCloseGuard>
      <App />
    </WalletCloseGuard>,
  );
};

renderApp().catch(console.error);
