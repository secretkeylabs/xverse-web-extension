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
import { isRunesTx } from './utils';

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
    toTokenInfo?: Coin;
  },
) {
  let fromAmount;
  let receiveAmount;
  let toAmount;
  let fromPrincipal;
  let toPrincipal;

  const from = fromToken?.name;
  const to = toToken?.name ?? toToken?.ticker;

  if (isRunesTx({ fromToken, toToken })) {
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
        : new BigNumber(fromToken?.tokenFiatRate ?? 0).multipliedBy(amount).toFixed(2);

    receiveAmount = quote?.receiveAmount ? new BigNumber(quote?.receiveAmount) : undefined;
    if (receiveAmount) {
      toAmount =
        toToken?.protocol === 'stx'
          ? getStxFiatEquivalent(
              stxToMicrostacks(receiveAmount),
              new BigNumber(stxBtcRate),
              new BigNumber(btcUsdRate),
            ).toFixed(2)
          : new BigNumber(toTokenInfo?.tokenFiatRate ?? 0).multipliedBy(receiveAmount).toFixed(2);
    }
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
