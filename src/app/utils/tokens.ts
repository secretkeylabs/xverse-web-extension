import {
  getFiatEquivalent,
  getFungibleTokenStates,
  microstacksToStx,
  satsToBtc,
  type FungibleToken,
  type FungibleTokenWithStates,
  type StxAddressData,
} from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { ftDecimals, getTicker } from './helper';

export function getFtTicker(ft: FungibleToken): string {
  if (ft?.protocol === 'runes') {
    return ft.runeSymbol ?? ft.ticker ?? '';
  }
  if (ft?.ticker) {
    return ft.protocol === 'brc-20' ? ft.ticker.toUpperCase() : ft.ticker;
  }
  if (ft?.name) {
    return getTicker(ft.name).toUpperCase();
  }
  return '';
}

export function getFtBalance(ft: FungibleToken) {
  if (ft && ft.decimals) {
    return ftDecimals(ft.balance, ft.decimals);
  }
  return BigNumber(ft?.balance).toFixed();
}

export function getBalanceAmount(
  currency: CurrencyTypes,
  ft?: FungibleToken,
  stxData?: StxAddressData,
  btcBalance?: number,
) {
  switch (currency) {
    case 'STX':
      return microstacksToStx(new BigNumber(stxData?.balance ?? 0)).toString();
    case 'BTC':
      return satsToBtc(new BigNumber(btcBalance ?? 0)).toString();
    case 'FT':
      return ft ? getFtBalance(ft) : '';
    default:
      return '';
  }
}

export const sortFtByFiatBalance = (
  a: FungibleToken,
  b: FungibleToken,
  stxBtcRate: string,
  btcFiatRate: string,
) => {
  const aFiatAmount = getFiatEquivalent(
    Number(getFtBalance(a)),
    'FT',
    BigNumber(stxBtcRate),
    BigNumber(btcFiatRate),
    a,
  );
  const bFiatAmount = getFiatEquivalent(
    Number(getFtBalance(b)),
    'FT',
    BigNumber(stxBtcRate),
    BigNumber(btcFiatRate),
    b,
  );
  // Handle empty values explicitly
  if (aFiatAmount === '' && bFiatAmount === '') return 0;
  if (aFiatAmount === '') return 1;
  if (bFiatAmount === '') return -1;
  const aAmount = BigNumber(aFiatAmount || 0);
  const bAmount = BigNumber(bFiatAmount || 0);
  return aAmount.isLessThan(bAmount) ? 1 : aAmount.isGreaterThan(bAmount) ? -1 : 0;
};

type FTTokenVisibilityObject = Record<FungibleToken['principal'], boolean | undefined>;

export const selectWithDerivedState =
  ({
    manageTokens,
    spamTokens,
    showSpamTokens,
    topTokensData,
    select,
  }: {
    manageTokens: FTTokenVisibilityObject;
    spamTokens?: string[];
    showSpamTokens: boolean;
    topTokensData?: Record<string, FungibleToken>;
    select?: (data: FungibleTokenWithStates[]) => FungibleTokenWithStates[];
  }) =>
  (data: FungibleToken[]) => {
    const topTokens = { ...topTokensData };
    const tokensWithDerivedState = data.map((ft: FungibleToken) => {
      let token = ft;
      if (topTokens[token.principal]) {
        delete topTokens[token.principal];
        token = { ...token, isTopToken: true };
      }
      return {
        ...token,
        ...getFungibleTokenStates({
          fungibleToken: token,
          manageTokens,
          spamTokens,
          showSpamTokens,
        }),
      } as FungibleTokenWithStates;
    });
    const topTokensWithDerivedState = Object.values(topTokens).map((ft) => {
      const token = { ...ft, isTopToken: true };
      return {
        ...token,
        ...getFungibleTokenStates({
          fungibleToken: token,
          manageTokens,
          spamTokens,
          showSpamTokens,
        }),
      };
    });
    const withDerivedState = tokensWithDerivedState.concat(topTokensWithDerivedState);
    return select ? select(withDerivedState) : withDerivedState;
  };
