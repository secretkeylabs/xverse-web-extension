import rootStore from '@stores/index';
import { setWalletSeedPhraseAction } from '@stores/wallet/actions/actionCreators';
import { createRoot } from 'react-dom/client';
import { queryClient, offlineStorage } from '@utils/query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { decryptMnemonic } from '@stacks/encryption';
import App from '../../app/App';
import './index.css';

declare const VERSION: string;

async function restoreSession() {
  const { pHash } = await chrome.storage.session.get('pHash');
  const { walletState } = rootStore.store.getState();
  if (pHash) {
    const seed = await decryptMnemonic(walletState.encryptedSeed, pHash);
    rootStore.store.dispatch(setWalletSeedPhraseAction(seed));
    return Promise.resolve();
  }
  return Promise.resolve();
}

const renderApp = async () => {
  await restoreSession();
  persistQueryClient({
    queryClient,
    persister: offlineStorage,
    buster: VERSION,
  });
  const container = document.getElementById('app');
  const root = createRoot(container);
  return root.render(<App />);
};
renderApp();
