import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import { BitcoinNetworkType } from '@sats-connect/core';
import type { CreateRuneListingRequest, Marketplace } from '@secretkeylabs/xverse-core';
import { sanitizeRuneName } from '@utils/helper';
import type { RuneItem } from '@utils/runes';
import { useCallback, useState } from 'react';

const useRuneSellPsbtPerMarketplace = (
  runeName: string,
  listingUtxos: Record<string, RuneItem>,
  selectedMarketplaces: Marketplace[],
) => {
  const { network } = useWalletSelector();
  const { ordinalsAddress, ordinalsPublicKey, btcAddress } = useSelectedAccount();

  const [loading, setLoading] = useState<boolean>(false);
  const [signPsbtPayload, setSignPsbtPayload] = useState<null | object>(null);
  const [error, setError] = useState<string | null>(null);
  const xverseApi = useXverseApi();

  const getRuneSellPsbt = useCallback(async () => {
    const sanitizedRuneName = sanitizeRuneName(runeName);
    const utxosToList = Object.entries(listingUtxos)
      .filter((item) => item[1].selected)
      .map(([key, item]) => ({
        location: key.split(':')[0],
        index: Number(key.split(':')[1]),
        priceSats: item.priceSats,
        amount: item.amount,
      }));

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 10); // 10 days from now

    const args: CreateRuneListingRequest = {
      rune: sanitizedRuneName,
      makerRunesPublicKey: ordinalsPublicKey,
      makerRunesAddress: ordinalsAddress,
      makerReceiveAddress: btcAddress,
      utxos: utxosToList,
      expiresAt: expiresAt.toISOString(),
      marketplaces: selectedMarketplaces,
    };

    setLoading(true);
    setError(null);

    await xverseApi.listings
      .getRuneSellOrder(args)
      .then((sellOrder) => {
        const payload = {
          network: {
            type:
              network.type === 'Mainnet' ? BitcoinNetworkType.Mainnet : BitcoinNetworkType.Testnet,
          },
          message: 'Sign Transactions',
          psbts: sellOrder.map((order) => ({
            psbtBase64: order.psbt,
            inputsToSign: undefined,
            marketplaceName: order.marketplace.name,
            batchAuctionId: order.batchAuctionId,
          })),
        };

        setSignPsbtPayload(payload);
      })
      .catch(() => setError('Failed to create listing'))
      .finally(() => setLoading(false));
  }, [
    runeName,
    listingUtxos,
    btcAddress,
    network,
    ordinalsAddress,
    ordinalsPublicKey,
    xverseApi,
    selectedMarketplaces,
  ]);

  return { getRuneSellPsbt, loading, signPsbtPayload, error };
};

export default useRuneSellPsbtPerMarketplace;
