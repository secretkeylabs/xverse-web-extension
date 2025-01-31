import {
  getBtcFiatEquivalent,
  getStxFiatEquivalent,
  stxToMicrostacks,
  type FungibleToken,
  type Provider,
  type Quote,
} from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';

const getFiatEquivalent = ({
  token,
  amount,
  btcUsdRate,
  runeFloorPrice,
  stxBtcRate,
  stxTokenFiatValue,
}: {
  token: FungibleToken | undefined;
  amount: BigNumber;
  btcUsdRate: BigNumber;
  runeFloorPrice?: BigNumber;
  stxBtcRate?: BigNumber;
  stxTokenFiatValue?: BigNumber;
}) => {
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

type SwapTrackingProperties = {
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

const getSwapsMixpanelProperties = ({
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
  const toTokenAmount = quote?.receiveAmount;
  let rawFromTokenUsdValue;

  let fromTokenUsdValue = getFiatEquivalent({
    token: fromToken,
    amount: new BigNumber(amount),
    btcUsdRate,
    runeFloorPrice: fromRuneFloorPrice,
    stxBtcRate,
    stxTokenFiatValue: fromStxTokenFiatValue,
  });

  // Derive fromTokenUsdValue from received STX amount
  if (toToken?.principal === 'STX' && quote?.receiveAmount && stxBtcRate) {
    rawFromTokenUsdValue = fromTokenUsdValue;

    fromTokenUsdValue = getFiatEquivalent({
      token: toToken,
      amount: new BigNumber(quote.receiveAmount),
      btcUsdRate,
      stxBtcRate,
    });
  }

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
    ...(rawFromTokenUsdValue ? { rawFromTokenUsdValue } : {}),
  };
};

// eslint-disable-next-line import/prefer-default-export
export { getSwapsMixpanelProperties };
