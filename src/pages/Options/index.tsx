import { InternalMethods } from '@common/types/message-types';
import rootStore from '@stores/index';
import { setWalletSeedPhraseAction } from '@stores/wallet/actions/actionCreators';
import { createRoot } from 'react-dom/client';
import { queryClient, offlineStorage } from '@utils/query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import migrateCachedStorage from '@utils/migrate';
import App from '../../app/App';
import './index.css';

declare const VERSION: string;

async function checkForInMemoryKeys() {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => chrome.runtime.sendMessage({ method: InternalMethods.RequestInMemoryKeys }, (resp) => {
    if (Object.keys(resp).length === 0) return resolve(true);
    rootStore.store.dispatch(setWalletSeedPhraseAction(resp));
    resolve(true);
  }));
}

const renderApp = async () => {
  await checkForInMemoryKeys();
  persistQueryClient({
    queryClient,
    persister: offlineStorage,
    buster: VERSION,
  });
  await migrateCachedStorage();
  const container = document.getElementById('app');
  const root = createRoot(container);
  return root.render(<App />);
};

renderApp();
