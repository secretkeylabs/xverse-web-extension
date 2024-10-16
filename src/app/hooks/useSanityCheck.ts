import { getAccountFromSeedPhrase, getXverseApiClient } from '@secretkeylabs/xverse-core';
import { useCallback } from 'react';
import useSeedVault from './useSeedVault';
import useWalletSelector from './useWalletSelector';

declare const VERSION: string;

const useSanityCheck = () => {
  const { network, accountsList } = useWalletSelector();
  const { getSeed } = useSeedVault();

  const getSanityCheck = useCallback(
    async (origin: string) => {
      const mnemonic = await getSeed();

      const wallet = await getAccountFromSeedPhrase({ mnemonic, index: 0n, network: network.type });
      if (wallet.masterPubKey !== accountsList[0].masterPubKey) {
        await getXverseApiClient(network.type).getAppFeatures(
          {
            ordinalsAddress: accountsList[0].btcAddresses.taproot.address,
            paymentAddress:
              accountsList[0].btcAddresses.native?.address ||
              accountsList[0].btcAddresses.nested?.address,
          },
          {
            [origin]: VERSION,
          },
        );
        return false;
      }
      return true;
    },
    [network.type, getSeed],
  );

  return { getSanityCheck };
};

export default useSanityCheck;
