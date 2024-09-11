import {
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
  type Coin,
  type FungibleToken,
  type Provider,
  type Quote,
  type Token,
} from '@secretkeylabs/xverse-core';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { getTrackingIdentifier, isRunesTx } from './utils';

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
    stxBtcRate,
    fromTokenInfo,
    toTokenInfo,
  }: {
    provider?: Provider;
    fromToken?: FungibleToken;
    toToken?: Token;
    amount: string;
    quote?: Quote;
    btcUsdRate: string;
    runeFloorPrice?: number;
    stxBtcRate?: string;
    fromTokenInfo?: Coin;
    toTokenInfo?: Coin;
  },
) {
  let fromAmount;
  let receiveAmount;
  let toAmount;
  let fromPrincipal;
  let toPrincipal;

  const from = getTrackingIdentifier(fromToken);
  const to = getTrackingIdentifier(toToken);

  if (fromToken && toToken && isRunesTx({ fromToken, toToken })) {
    fromAmount =
      fromToken?.principal === 'BTC'
        ? getBtcFiatEquivalent(new BigNumber(amount), new BigNumber(btcUsdRate)).toFixed(2)
        : new BigNumber(fromToken?.tokenFiatRate ?? 0).multipliedBy(amount).toFixed(2);

    receiveAmount = quote?.receiveAmount ? new BigNumber(quote?.receiveAmount) : undefined;
    toAmount = receiveAmount
      ? getBtcFiatEquivalent(
          toToken?.protocol === 'btc'
            ? receiveAmount
            : receiveAmount.multipliedBy(runeFloorPrice ?? 0),
          new BigNumber(btcUsdRate),
        ).toFixed(2)
      : undefined;
  } else if (stxBtcRate) {
    fromPrincipal = fromToken?.principal;
    toPrincipal = toToken?.ticker;

    fromAmount =
      fromToken?.principal === 'STX'
        ? getStxFiatEquivalent(
            stxToMicrostacks(new BigNumber(amount)),
            new BigNumber(stxBtcRate),
            new BigNumber(btcUsdRate),
          ).toFixed(2)
        : fromTokenInfo?.tokenFiatRate
        ? new BigNumber(fromTokenInfo?.tokenFiatRate).multipliedBy(amount).toFixed(2)
        : '--';

    receiveAmount = quote?.receiveAmount ? new BigNumber(quote?.receiveAmount) : undefined;
    if (receiveAmount) {
      toAmount =
        toToken?.protocol === 'stx'
          ? getStxFiatEquivalent(
              stxToMicrostacks(receiveAmount),
              new BigNumber(stxBtcRate),
              new BigNumber(btcUsdRate),
            ).toFixed(2)
          : toTokenInfo?.tokenFiatRate
          ? new BigNumber(toTokenInfo?.tokenFiatRate).multipliedBy(receiveAmount).toFixed(2)
          : '--';
    }
  }

  // Don't track for zero-like fiat values
  if (
    Number.isNaN(parseFloat(fromAmount)) ||
    parseFloat(fromAmount) <= 0 ||
    Number.isNaN(parseFloat(toAmount)) ||
    parseFloat(toAmount) <= 0
  ) {
    return;
  }

  trackMixPanel(eventName, {
    ...(provider ? { provider: provider?.name } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(fromPrincipal ? { fromPrincipal } : {}),
    ...(toPrincipal ? { toPrincipal } : {}),
    fromAmount,
    ...(toAmount ? { toAmount } : {}),
  });
}

export default trackSwapMixPanel;
