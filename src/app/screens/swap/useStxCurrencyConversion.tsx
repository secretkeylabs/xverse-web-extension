import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken, getFiatEquivalent, microstacksToStx } from '@secretkeylabs/xverse-core';
import { ftDecimals } from '@utils/helper';
import { AlexSDK, Currency } from 'alex-sdk';
import BigNumber from 'bignumber.js';
import { SwapToken } from './types';

// eslint-disable-next-line import/prefer-default-export
export function useStxCurrencyConversion() {
  const alexSDK = new AlexSDK();
  const { stxAvailableBalance, stxBtcRate, btcFiatRate } = useWalletSelector();
  const { visible: sip10CoinsList } = useVisibleSip10FungibleTokens();

  const acceptableCoinList = sip10CoinsList
    .filter((sc) => alexSDK.getCurrencyFrom(sc.principal) != null)
    // TODO tim: remove this once alexsdk fix issue here
    // https://github.com/alexgo-io/alex-sdk/issues/2
    .filter((sc) => sc.principal !== 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-db20')
    .map<FungibleToken>((sc) => ({
      ...sc,
      assetName: '',
      total_sent: sc?.total_sent ?? '0',
      total_received: sc?.total_received ?? '0',
      balance: sc?.balance ?? '0',
    }));

  function currencyToToken(currency?: Currency, amount?: number): SwapToken | undefined {
    if (currency == null) {
      return undefined;
    }
    if (currency === Currency.STX) {
      return {
        balance: Number(microstacksToStx(BigNumber(stxAvailableBalance) as any)),
        image: { currency: 'STX', size: 28 },
        name: 'STX',
        amount,
        fiatAmount:
          amount != null
            ? Number(
                getFiatEquivalent(
                  amount,
                  'STX',
                  BigNumber(stxBtcRate) as any,
                  BigNumber(btcFiatRate) as any,
                ),
              )
            : undefined,
      };
    }
    const token = acceptableCoinList.find(
      (c) => alexSDK.getCurrencyFrom(c.principal) === currency,
    )!;
    if (token == null) {
      return undefined;
    }
    return {
      amount,
      image: { fungibleToken: token, size: 28 },
      name: (token.ticker ?? token.name).toUpperCase(),
      balance: Number(ftDecimals(token.balance, token.decimals ?? 0)),
      fiatAmount:
        amount != null
          ? Number(
              getFiatEquivalent(amount, 'FT', BigNumber(stxBtcRate), BigNumber(btcFiatRate), token),
            )
          : undefined,
    };
  }

  return {
    acceptableCoinList,
    currencyToToken,
  };
}
