import { InternalMethods } from 'content-scripts/message-types';
import rootStore from '@stores/index';
import { createRoot } from 'react-dom/client';
import App from '../../app/App';
import './index.css';
import { setWalletSeedPhraseAction } from '@stores/wallet/actions/actionCreators';

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
  const container = document.getElementById('app');
  const root = createRoot(container);
  return root.render(<App />);
};

renderApp();
