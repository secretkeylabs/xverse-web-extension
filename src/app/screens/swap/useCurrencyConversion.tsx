import useWalletSelector from '@hooks/useWalletSelector';
import { FungibleToken, getFiatEquivalent, microstacksToStx } from '@secretkeylabs/xverse-core';
import { LoaderSize } from '@utils/constants';
import { ftDecimals } from '@utils/helper';
import { AlexSDK, Currency } from 'alex-sdk';
import BigNumber from 'bignumber.js';
import { SwapToken } from './useSwap';

export function useCurrencyConversion() {
  const alexSDK = new AlexSDK();
  const {
    coins: supportedCoins = [],
    coinsList: visibleCoins = [],
    stxAvailableBalance,
    stxBtcRate,
    btcFiatRate,
  } = useWalletSelector();

  const acceptableCoinList = supportedCoins
    .filter((sc) => alexSDK.getCurrencyFrom(sc.contract) != null)
    // TODO tim: remove this once alexsdk fix issue here
    // https://github.com/alexgo-io/alex-sdk/issues/2
    .filter((sc) => sc.contract !== 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-db20')
    .map<FungibleToken>((sc) => {
      const ft = (visibleCoins || []).find((vc) => vc.principal === sc.contract);
      return {
        ...ft,
        ...sc,
        principal: sc.contract,
        assetName: '',
        total_sent: ft?.total_sent ?? '0',
        total_received: ft?.total_received ?? '0',
        balance: ft?.balance ?? '0',
      };
    });

  function currencyToToken(currency?: Currency, amount?: number): SwapToken | undefined {
    if (currency == null) {
      return undefined;
    }
    if (currency === Currency.STX) {
      return {
        balance: Number(microstacksToStx(BigNumber(stxAvailableBalance) as any)),
        image: { token: 'STX', size: 28, loaderSize: LoaderSize.SMALL },
        name: 'STX',
        amount,
        fiatAmount:
          amount != null
            ? Number(getFiatEquivalent(amount, 'STX', stxBtcRate as any, btcFiatRate as any))
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
      image: { fungibleToken: token, size: 28, loaderSize: LoaderSize.SMALL },
      name: (token.ticker ?? token.name).toUpperCase(),
      balance: Number(ftDecimals(token.balance, token.decimals ?? 0)),
      fiatAmount:
        amount != null
          ? Number(getFiatEquivalent(amount, 'FT', stxBtcRate as any, btcFiatRate as any, token))
          : undefined,
    };
  }

  return {
    acceptableCoinList,
    currencyToToken,
  };
}
