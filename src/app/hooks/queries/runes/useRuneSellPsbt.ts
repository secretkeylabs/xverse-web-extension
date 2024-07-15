import useRunesApi from '@hooks/apiClients/useRunesApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { BitcoinNetworkType } from '@sats-connect/core';
import { RuneSellRequest } from '@secretkeylabs/xverse-core';
import { RuneItem } from '@utils/runes';
import { useCallback, useState } from 'react';

/*
  Currently only supports MagicEden.
  This hook returns a function where we call ME Sell Runes API to return a psbtBase64 for PSBT construction
 */
const useRuneSellPsbt = (runeName: string, listingUtxos: Record<string, RuneItem>) => {
  const { network } = useWalletSelector();
  const { ordinalsAddress, ordinalsPublicKey, btcAddress } = useSelectedAccount();

  const [loading, setLoading] = useState<boolean>(false);
  const [signPsbtPayload, setSignPsbtPayload] = useState<null | object>(null);
  const [error, setError] = useState<string | null>(null);
  const runesApi = useRunesApi();

  const getRuneSellPsbt = useCallback(async () => {
    const sanitizedRuneName = runeName.replace(/[^A-Za-z]+/g, '').toUpperCase();
    const utxosToList = Object.entries(listingUtxos)
      .filter((item) => item[1].selected)
      .map(([key, item]) => ({
        location: key,
        priceSats: Math.round(item.amount * item.priceSats),
      }));
    const expiresAt = new Date();
    // setting the expiration date to 10 days from now
    expiresAt.setDate(expiresAt.getDate() + 10);

    const args: RuneSellRequest = {
      side: 'sell',
      rune: sanitizedRuneName,
      makerRunesPublicKey: ordinalsPublicKey,
      makerRunesAddress: ordinalsAddress,
      makerReceiveAddress: btcAddress,
      utxos: utxosToList,
      expiresAt: expiresAt.toISOString(),
    };

    try {
      setLoading(true);
      setError(null);
      const sellOrder = await runesApi.getRunesSellOrder(args);
      const psbtBase64 = sellOrder.orderPsbtBase64;
      const payload = {
        network: {
          type:
            network.type === 'Mainnet' ? BitcoinNetworkType.Mainnet : BitcoinNetworkType.Testnet,
        },
        broadcast: false,
        inputsToSign: undefined,
        psbtBase64,
        message: 'Sign Transaction',
      };
      setSignPsbtPayload(payload);
    } catch (err) {
      setError('Failed to create listing');
    } finally {
      setLoading(false);
    }
  }, [runeName, listingUtxos, btcAddress, network, ordinalsAddress, ordinalsPublicKey, runesApi]);

  return { getRuneSellPsbt, loading, signPsbtPayload, error };
};

export default useRuneSellPsbt;
