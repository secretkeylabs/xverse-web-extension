import WalletResetGuard from '@components/guards/walletResetGuard';
import { decryptMnemonic } from '@stacks/encryption';
import rootStore from '@stores/index';
import { setWalletSeedPhraseAction } from '@stores/wallet/actions/actionCreators';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { offlineStorage, queryClient } from '@utils/query';
import { createRoot } from 'react-dom/client';
import App from '../../app/App';
import './index.css';

declare const VERSION: string;

async function restoreSession() {
  const { pHash } = await chrome.storage.session.get('pHash');
  const { walletState } = rootStore.store.getState();
  if (pHash) {
    const seed = await decryptMnemonic(walletState.encryptedSeed, pHash);
    rootStore.store.dispatch(setWalletSeedPhraseAction(seed));
  }
}

const renderApp = async () => {
  await restoreSession();
  persistQueryClient({
    queryClient,
    persister: offlineStorage,
    buster: VERSION,
  });
  const container = document.getElementById('app');
  const root = createRoot(container!);
  return root.render(
    <WalletResetGuard>
      <App />
    </WalletResetGuard>,
  );
};

renderApp();
