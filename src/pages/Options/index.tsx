import WalletCloseGuard from '@components/guards/walletCloseGuard';
import { decryptMnemonic } from '@stacks/encryption';
import rootStore from '@stores/index';
import { setWalletSeedPhraseAction } from '@stores/wallet/actions/actionCreators';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { offlineStorage, queryClient } from '@utils/query';
import { SessionStorageKeys, getFromSessionStorage } from '@utils/sessionStorageUtils';
import ChromeStorage from '@utils/storage';
import { decryptSeedPhrase } from '@utils/encryptionUtils';
import { createRoot } from 'react-dom/client';
import App from '../../app/App';
import './index.css';

declare const VERSION: string;

async function restoreSession() {
  const pHash = await getFromSessionStorage(SessionStorageKeys.PASSWORD_HASH);
  const encryptedSeed = await ChromeStorage.getItem('seed');
  if (pHash && encryptedSeed) {
    const seed = await decryptSeedPhrase(encryptedSeed as string, pHash);
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
    <WalletCloseGuard>
      <App />
    </WalletCloseGuard>,
  );
};

renderApp();
