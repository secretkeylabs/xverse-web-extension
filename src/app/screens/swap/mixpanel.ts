import {
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
  type FungibleToken,
  type Provider,
  type Quote,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';

const getFiatEquivalent = (
  token: FungibleToken | undefined,
  amount: BigNumber,
  btcUsdRate: BigNumber,
  runeFloorPrice?: BigNumber,
  stxBtcRate?: BigNumber,
  stxTokenFiatValue?: BigNumber,
) => {
  if (!token || amount.isZero()) {
    return undefined;
  }

  if (token.principal === 'BTC') {
    return getBtcFiatEquivalent(amount, btcUsdRate).toFixed(2);
  }

  if (token.protocol === 'runes' && runeFloorPrice) {
    return getBtcFiatEquivalent(runeFloorPrice.multipliedBy(amount), btcUsdRate).toFixed(2);
  }

  if (token.principal === 'STX' && stxBtcRate) {
    return getStxFiatEquivalent(stxToMicrostacks(amount), stxBtcRate, btcUsdRate).toFixed(2);
  }

  return amount.multipliedBy(stxTokenFiatValue ?? 0).toFixed(2);
};

export type SwapTrackingProperties = {
  provider?: Provider;
  fromToken?: FungibleToken;
  toToken?: FungibleToken;
  amount: string;
  quote?: Quote;
  btcUsdRate: BigNumber;
  fromRuneFloorPrice?: BigNumber;
  fromStxTokenFiatValue?: BigNumber;
  stxBtcRate?: BigNumber;
};

export const getSwapsMixpanelProperties = ({
  provider,
  fromToken,
  toToken,
  amount,
  quote,
  btcUsdRate,
  fromRuneFloorPrice,
  fromStxTokenFiatValue,
  stxBtcRate,
}: SwapTrackingProperties) => {
  const from =
    fromToken?.principal === 'BTC' || fromToken?.principal === 'STX'
      ? fromToken?.principal
      : fromToken?.name;
  const to = toToken?.principal === 'BTC' ? 'BTC' : toToken?.name ?? toToken?.ticker;

  const fromTokenAmount = amount;

  const fromTokenUsdValue = getFiatEquivalent(
    fromToken,
    new BigNumber(amount),
    btcUsdRate,
    fromRuneFloorPrice,
    stxBtcRate,
    fromStxTokenFiatValue,
  );

  const toTokenAmount = quote?.receiveAmount;

  const fromPrincipal = fromToken?.protocol === 'stacks' ? fromToken?.principal : undefined;
  const toPrincipal = toToken?.protocol === 'stacks' ? toToken?.principal : undefined;

  return {
    ...(provider && { provider: provider.name }),
    ...(from && { from }),
    ...(to && { to }),
    ...(fromPrincipal && { fromPrincipal }),
    ...(toPrincipal && { toPrincipal }),
    ...(fromTokenAmount ? { fromTokenAmount } : {}),
    ...{ fromTokenUsdValue: fromTokenUsdValue ?? 0 },
    ...(toTokenAmount ? { toTokenAmount } : {}),
  };
};
