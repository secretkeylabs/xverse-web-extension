import BatchPsbtSigning from '@components/batchPsbtSigning';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useSelectedAccount from '@hooks/useSelectedAccount';
import type { SignMultiplePsbtPayload } from '@sats-connect/core';
import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import { trackMixPanel } from '@utils/mixpanel';
import type { RuneItem } from '@utils/runes';
import { useLocation, useNavigate } from 'react-router-dom';

type ListingPsbt = SignMultiplePsbtPayload & {
  marketplaceName: string;
  batchAuctionId: string;
};

function RuneListingBatchSigning() {
  const location = useLocation();
  const xverseApi = useXverseApi();
  const selectedAccount = useSelectedAccount();
  const navigate = useNavigate();

  const { psbts } = location.state.payload as { psbts: ListingPsbt[] };

  const onSigned = async (signedPsbts: string[]) => {
    trackMixPanel(AnalyticsEvents.ListRuneSigned, {
      from: location.state.selectedRune.name,
      to: 'BTC',
      priceInSatsPerRune: location.state.minPriceSats,
      marketplaces: location.state.payload.psbts.map((p) => p.marketplaceName),
      runeTotalAmount: Object.values(location.state.utxos as Record<string, RuneItem>)
        .map((i) => i.amount)
        .reduce((a, b) => a + b, 0),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 10); // 10 days from now

    try {
      const orders = await xverseApi.listings.submitRuneSellOrder(
        signedPsbts.map((psbtBase64, idx) => ({
          psbtBase64,
          marketplaceName: psbts[idx].marketplaceName,
          batchAuctionId: psbts[idx].batchAuctionId,
          ordinalsPublicKey: selectedAccount.ordinalsPublicKey,
          ordinalsAddress: selectedAccount.ordinalsAddress,
          btcAddress: selectedAccount.btcAddress,
          rune: {
            name: location.state.selectedRune?.assetName ?? '',
            id: location.state.selectedRune?.principal ?? '',
          },
          expiresAt: expiresAt.toISOString(),
          utxos: Object.entries(location.state.utxos as Record<string, RuneItem>).map(
            ([runeLocation, utxo]) => ({
              txid: runeLocation.split(':')[0],
              index: Number(runeLocation.split(':')[1]),
              priceSatsPerRune: utxo.priceSats,
              runeAmount: utxo.amount,
            }),
          ),
        })),
      );

      navigate('/tx-status', {
        state: {
          runeListed: location.state.selectedRune,
          orders,
          minPriceSats: location.state.minPriceSats,
        },
      });
    } catch (e) {
      const error = e instanceof Error ? e.message : '';
      navigate('/tx-status', {
        state: {
          txid: '',
          error,
          browserTx: true,
        },
      });
    }
  };

  const onCancel = () => {
    navigate('/');
  };

  const onDone = () => {
    navigate('/');
  };

  return (
    <BatchPsbtSigning
      psbts={psbts}
      onSigned={onSigned}
      onCancel={onCancel}
      onPostSignDone={onDone}
    />
  );
}

export default RuneListingBatchSigning;
