import { getXverseApiClient, walletFromSeedPhrase } from '@secretkeylabs/xverse-core';
import { useCallback } from 'react';
import useSeedVault from './useSeedVault';
import useWalletSelector from './useWalletSelector';

declare const VERSION: string;

const useSanityCheck = () => {
  const { selectedAccount, network } = useWalletSelector();
  const { getSeed } = useSeedVault();

  const getSanityCheck = useCallback(
    async (origin: string) => {
      if (!selectedAccount?.masterPubKey || !network.type) {
        return true;
      }
      const mnemonic = await getSeed();

      const wallet = await walletFromSeedPhrase({ mnemonic, index: 0n, network: network.type });
      if (wallet.masterPubKey !== selectedAccount.masterPubKey) {
        await getXverseApiClient(network.type).getAppFeatures(undefined, { [origin]: VERSION });
        return false;
      }
      return true;
    },
    [selectedAccount?.masterPubKey, network.type, getSeed],
  );

  return { getSanityCheck };
};

export default useSanityCheck;
