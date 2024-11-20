import {
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
  type Coin,
  type FungibleToken,
  type Provider,
  type Quote,
} from '@secretkeylabs/xverse-core';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { getTrackingIdentifier, isRunesTx } from './utils';

// TODO add typing to this. the properties actually sent to mixpanel no longer match what's defined in xverse-core
function trackSwapMixPanel(
  eventName,
  {
    provider,
    fromToken,
    toToken,
    amount,
    quote,
    btcUsdRate,
    stxBtcRate,
    fromTokenInfo,
  }: {
    provider?: Provider;
    fromToken?: FungibleToken;
    toToken?: FungibleToken;
    amount: string;
    quote?: Quote;
    btcUsdRate: string;
    stxBtcRate?: string;
    fromTokenInfo?: Coin;
  },
) {
  let fromTokenAmount;
  let toTokenAmount;
  let fromTokenUsdValue;
  let fromPrincipal;
  let toPrincipal;

  const from = getTrackingIdentifier(fromToken);
  const to = getTrackingIdentifier(toToken);

  const receiveAmount = quote?.receiveAmount ? new BigNumber(quote?.receiveAmount) : undefined;

  if (receiveAmount) {
    toTokenAmount = receiveAmount.toFixed(2);
  }

  if (fromToken && toToken && isRunesTx({ fromToken, toToken })) {
    fromTokenUsdValue =
      fromToken?.principal === 'BTC'
        ? getBtcFiatEquivalent(new BigNumber(amount), new BigNumber(btcUsdRate)).toFixed(2)
        : new BigNumber(fromToken?.tokenFiatRate ?? 0).multipliedBy(amount).toFixed(2);
    fromTokenAmount = amount;
  } else if (stxBtcRate) {
    fromPrincipal = fromToken?.principal;
    toPrincipal = toToken?.principal;

    fromTokenAmount = amount;
    fromTokenUsdValue =
      fromToken?.principal === 'STX'
        ? getStxFiatEquivalent(
            stxToMicrostacks(new BigNumber(amount)),
            new BigNumber(stxBtcRate),
            new BigNumber(btcUsdRate),
          ).toFixed(2)
        : fromTokenInfo?.tokenFiatRate
        ? new BigNumber(fromTokenInfo?.tokenFiatRate).multipliedBy(amount).toFixed(2)
        : 0;
  }

  trackMixPanel(eventName, {
    ...(provider ? { provider: provider?.name } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(fromPrincipal ? { fromPrincipal } : {}),
    ...(toPrincipal ? { toPrincipal } : {}),
    ...(fromTokenAmount ? { fromTokenAmount } : {}),
    ...(fromTokenUsdValue ? { fromTokenUsdValue } : {}),
    ...(toTokenAmount ? { toTokenAmount } : {}),
  });
}

export default trackSwapMixPanel;
