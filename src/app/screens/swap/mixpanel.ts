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
    btcUsdRate,
    runeFloorPrice,
  }: {
    provider?: Provider;
    fromToken?: FungibleToken;
    toToken?: Token;
    amount: string;
    quote?: Quote;
    btcUsdRate: string;
    runeFloorPrice?: number;
  },
) {
  const from = fromToken?.name;
  const to = toToken?.protocol === 'btc' ? 'BTC' : toToken?.name ?? toToken?.ticker;

  const fromAmount =
    fromToken?.principal === 'BTC'
      ? getBtcFiatEquivalent(new BigNumber(amount), new BigNumber(btcUsdRate)).toFixed(2)
      : new BigNumber(fromToken?.tokenFiatRate ?? 0).multipliedBy(amount).toFixed(2);

  const receiveAmount = quote?.receiveAmount ? new BigNumber(quote?.receiveAmount) : undefined;
  const toAmount = receiveAmount
    ? getBtcFiatEquivalent(
        toToken?.protocol === 'btc'
          ? receiveAmount
          : receiveAmount.multipliedBy(runeFloorPrice ?? 0),
        new BigNumber(btcUsdRate),
      ).toFixed(2)
    : undefined;

  trackMixPanel(eventName, {
    ...(provider ? { provider: provider?.name } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    fromAmount,
    ...(toAmount ? { toAmount } : {}),
  });
}

export default trackSwapMixPanel;
