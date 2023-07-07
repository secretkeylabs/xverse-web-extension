import rootStore from '@stores/index';
import { setWalletSeedPhraseAction } from '@stores/wallet/actions/actionCreators';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { offlineStorage, queryClient } from '@utils/query';
import { getSessionItem } from '@utils/sessionStorageUtils';
import ChromeStorage from '@utils/storage';
import { SeedVaultStorageKeys } from '@secretkeylabs/xverse-core/seedVault';
import { decryptSeedPhrase } from '@utils/encryptionUtils';
import { createRoot } from 'react-dom/client';
import App from '../../app/App';
import './index.css';

declare const VERSION: string;

async function restoreSession() {
  const pHash = await getSessionItem(SeedVaultStorageKeys.PASSWORD_HASH);
  const encryptedSeed = await ChromeStorage.getItem(SeedVaultStorageKeys.ENCRYPTED_KEY);
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

  // We need to do this after load in order for the extension popup to have the correct height on first load
  container!.style.maxHeight = '100vh';

  const root = createRoot(container!);
  return root.render(<App />);
};
renderApp();
