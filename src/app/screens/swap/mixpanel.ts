import {
  getBtcFiatEquivalent,
  type FungibleToken,
  type Provider,
  type Quote,
  type Token,
} from '@secretkeylabs/xverse-core';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';

function trackSwapMixPanel(
  eventName,
  {
    provider,
    fromToken,
    toToken,
    amount,
    quote,
    btcFiatRate,
    runeFloorPrice,
  }: {
    provider?: Provider;
    fromToken?: FungibleToken | 'BTC';
    toToken?: Token;
    amount: string;
    quote?: Quote;
    btcFiatRate: string;
    runeFloorPrice?: number;
  },
) {
  const from = fromToken === 'BTC' ? 'BTC' : fromToken?.name;
  const to = toToken?.protocol === 'btc' ? 'BTC' : toToken?.name ?? toToken?.ticker;

  const fromAmount =
    fromToken === 'BTC'
      ? getBtcFiatEquivalent(new BigNumber(amount), new BigNumber(btcFiatRate)).toFixed(2)
      : new BigNumber(fromToken?.tokenFiatRate ?? 0).multipliedBy(amount).toFixed(2);

  const toAmount =
    toToken?.protocol === 'btc'
      ? getBtcFiatEquivalent(
          new BigNumber(quote?.receiveAmount ?? 0),
          new BigNumber(btcFiatRate),
        ).toFixed(2)
      : new BigNumber(quote?.receiveAmount ?? 0).multipliedBy(runeFloorPrice ?? 0).toFixed(2);

  trackMixPanel(eventName, {
    ...(provider ? { provider: provider?.name } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    fromAmount,
    toAmount,
  });
}

export default trackSwapMixPanel;
