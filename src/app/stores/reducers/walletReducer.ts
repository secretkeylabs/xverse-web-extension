import { Network } from 'app/core/types/networks';
import { Account } from 'app/core/types/accounts';
import { GenerateWalletKey, GenerateWalletSuccessKey } from '@stores/actions/wallet/types';
import { WalletActions } from '../actions/wallet/types';

interface WalletState {
  stxAddress: string;
  btcAddress: string;
  masterPubKey: string;
  stxPublicKey: string;
  btcPublicKey: string;
  generatingWallet: boolean;
  accountsList: Account[];
  selectedAccount: Account | null;
  network: Network;
}

const initialWalletState: WalletState = {
  stxAddress: '',
  btcAddress: '',
  masterPubKey: '',
  stxPublicKey: '',
  btcPublicKey: '',
  network: 'Mainnet',
  generatingWallet: false,
  accountsList: [],
  selectedAccount: null,
};

const walletReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: WalletState = initialWalletState,
  action: WalletActions,
) => {
  switch (action.type) {
    case GenerateWalletKey:
      return {
        ...state,
        generatingWallet: true,
      };
    case GenerateWalletSuccessKey:
      return {
        ...state,
        stxAddress: action.stxAddress,
        btcAddress: action.btcAddress,
        masterPubKey: action.masterPubKey,
        stxPublicKey: action.stxPublicKey,
        btcPublicKey: action.btcPublicKey,
        network: action.network,
        generatingWallet: false,
        accountsList: action.accountsList,
        selectedAccount: action.accountsList[0],
      };
    default:
      return state;
  }
};
export default walletReducer;
