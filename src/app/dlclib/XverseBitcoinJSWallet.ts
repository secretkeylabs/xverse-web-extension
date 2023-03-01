import { BitcoinJSWallet } from 'dlc-lib';
import { Network, Transaction } from 'bitcoinjs-lib';
import { Blockchain } from 'dlc-lib';
import { WalletStorage } from 'dlc-lib';
import { useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import { getBtcPrivateKey, NetworkType } from '@secretkeylabs/xverse-core';

export class XverseBitcoinJSWallet extends BitcoinJSWallet {
  constructor(storage: WalletStorage, network: Network, blockchain: Blockchain) {
    super(storage, network, blockchain);
  }

  async getNewAddress(): Promise<string> {
    const { btcAddress } = useSelector((state: StoreState) => state.walletState);
    return btcAddress;
  }
  async getNewPublicKey(): Promise<string> {
    const { btcPublicKey } = useSelector((state: StoreState) => state.walletState);
    return btcPublicKey;
  }
  async getPrivateKey(index: BigInt): Promise<string> {
    const network = 'Testnet';
    const { seedPhrase } = useSelector((state: StoreState) => state.walletState);
    const btcPrivateKey = getBtcPrivateKey({ seedPhrase, index, network });
    return btcPrivateKey;
  }

  async getBalance(): Promise<number> {
    const { btcBalance } = useSelector((state: StoreState) => state.walletState);
    return btcBalance.toNumber();
  }
}
