import { ReactNode, useEffect, useState } from 'react';
import { FungibleToken, microstacksToStx } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import TokenImage from '@components/tokenImage';
import { LoaderSize } from '@utils/constants';
import { AlexSDK, Currency } from 'alex-sdk';
import { ftDecimals } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { getFiatEquivalent } from '@secretkeylabs/xverse-core/transactions';
import { useNavigate } from 'react-router-dom';
import { SwapConfirmationInput } from '@screens/swap/swapConfirmation/useConfirmSwap';

export type SwapToken = {
  name: string;
  image: ReactNode;
  balance?: number;
  amount?: number;
  fiatAmount?: number;
};

export type UseSwap = {
  coinsList: FungibleToken[];
  isLoadingWalletData: boolean;
  selectedFromToken?: SwapToken;
  selectedToToken?: SwapToken;
  onSelectToken: (token: 'STX' | FungibleToken, side: 'from' | 'to') => void;
  inputAmount: string;
  inputAmountInvalid?: boolean;
  onInputAmountChanged: (amount: string) => void;
  submitError?: string;
  swapInfo?: {
    exchangeRate?: string;
    lpFee?: string;
    route?: string;
  };
  slippage: number;
  onSlippageChanged: (slippage: number) => void;
  minReceived?: number;
  onSwap?: () => void;
};

export function useSwap(): UseSwap {
  const navigate = useNavigate();
  const alexSDK = useState(() => new AlexSDK())[0];
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const { coinsList, stxAvailableBalance, stxBtcRate, btcFiatRate, fiatCurrency, stxAddress } =
    useWalletSelector();

  const acceptableCoinList =
    coinsList?.filter((c) => alexSDK.getCurrencyFrom(c.principal) != null) ?? [];

  const [inputAmount, setInputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.04);
  const [from, setFrom] = useState<Currency>();
  const [to, setTo] = useState<Currency>();

  const fromAmount = isNaN(Number(inputAmount)) ? undefined : Number(inputAmount);

  function currencyToToken(currency?: Currency, amount?: number): SwapToken | undefined {
    if (currency == null) {
      return undefined;
    }
    if (currency === Currency.STX) {
      return {
        balance: Number(microstacksToStx(BigNumber(stxAvailableBalance) as any)),
        image: <TokenImage round={true} token="STX" size={28} loaderSize={LoaderSize.SMALL} />,
        name: 'STX',
        amount,
        fiatAmount:
          amount != null
            ? Number(getFiatEquivalent(amount, 'STX', stxBtcRate as any, btcFiatRate as any))
            : undefined,
      };
    }
    const token = acceptableCoinList.find(
      (c) => alexSDK.getCurrencyFrom(c.principal) === currency
    )!;
    if (token == null) {
      return undefined;
    }
    return {
      amount,
      image: (
        <TokenImage round={true} fungibleToken={token} size={28} loaderSize={LoaderSize.SMALL} />
      ),
      name: (token.ticker ?? token.name).toUpperCase(),
      balance: Number(ftDecimals(token.balance, token.decimals ?? 0)),
      fiatAmount:
        amount != null
          ? Number(getFiatEquivalent(amount, 'FT', stxBtcRate as any, btcFiatRate as any, token))
          : undefined,
    };
  }

  function getCurrencyName(currency: Currency) {
    if (currency === Currency.STX) {
      return 'STX';
    }
    const token = acceptableCoinList.find(
      (c) => alexSDK.getCurrencyFrom(c.principal) === currency
    )!;
    if (token == null) {
      return currency;
    }
    return (token.ticker ?? token.name).toUpperCase();
  }

  function onSelectToken(token: 'STX' | FungibleToken, side: 'from' | 'to') {
    (side === 'from' ? setFrom : setTo)(
      token === 'STX' ? Currency.STX : alexSDK.getCurrencyFrom(token.principal)!
    );
  }

  const fromToken = currencyToToken(from, fromAmount);
  const inputAmountInvalid =
    isNaN(Number(inputAmount)) ||
    (fromAmount != null &&
      (fromAmount < 0 || (fromToken?.balance != null && fromToken.balance < fromAmount)));

  const [info, setInfo] = useState<{
    route: Currency[];
    feeRate: number;
  }>();

  useEffect(() => {
    if (from == null || to == null) {
      setInfo(undefined);
    } else {
      let cancelled = false;
      Promise.all([alexSDK.getFeeRate(from, to), alexSDK.getRouter(from, to)]).then((a) => {
        if (cancelled) {
          return;
        }
        setInfo({
          route: a[1],
          feeRate: Number(a[0]) / 1e8,
        });
      });
      return () => {
        cancelled = true;
      };
    }
  }, [from, to]);

  const [exchangeRate, setExchangeRate] = useState<number>();

  useEffect(() => {
    if (from == null || to == null || fromAmount == null || fromAmount == 0) {
      setExchangeRate(undefined);
    } else {
      let cancelled = false;
      alexSDK.getAmountTo(from, BigInt(fromAmount * 1e8), to).then((result) => {
        if (cancelled) {
          return;
        }
        setExchangeRate(Number(result) / 1e8 / fromAmount);
      });
      return () => {
        cancelled = true;
      };
    }
  }, [from, to, fromAmount]);

  function roundForDisplay(input?: number) {
    if (input == null) {
      return undefined;
    }
    return Math.floor(input * 1000) / 1000;
  }

  const toAmount =
    exchangeRate != null && fromAmount != null ? fromAmount * exchangeRate : undefined;

  const toToken = currencyToToken(to, roundForDisplay(toAmount));
  return {
    coinsList: acceptableCoinList,
    isLoadingWalletData: false,
    inputAmount: inputAmount,
    onInputAmountChanged: setInputAmount,
    selectedFromToken: fromToken,
    selectedToToken: toToken,
    slippage: slippage,
    onSlippageChanged: setSlippage,
    onSelectToken,
    inputAmountInvalid,
    minReceived: toAmount != null ? roundForDisplay(toAmount * (1 - slippage)) : undefined,
    swapInfo: {
      exchangeRate:
        exchangeRate != null && fromToken != null && toToken != null
          ? `1 ${fromToken.name} = ${roundForDisplay(exchangeRate)} ${toToken.name}`
          : undefined,
      route: info?.route.map(getCurrencyName).join(' -> '),
      lpFee:
        info?.feeRate != null && fromAmount != null && fromToken != null
          ? `${roundForDisplay(info.feeRate * fromAmount)} ${fromToken.name}`
          : undefined,
    },
    submitError: inputAmountInvalid ? 'Invalid amount' : undefined,
    onSwap:
      fromAmount != null && toAmount != null && from != null && to != null && info != null
        ? async () => {
            const tx = await alexSDK.runSwap(
              stxAddress,
              from,
              to,
              BigInt(fromAmount * 1e8),
              BigInt(Math.floor(toAmount * (1 - slippage) * 1e8)),
              info.route
            );
            const state: SwapConfirmationInput = {
              from: from!,
              to: to!,
              fromToken: fromToken!,
              toToken: toToken!,
              address: stxAddress,
              fromAmount: fromAmount!,
              minToAmount: toAmount! * (1 - slippage),
              lpFeeAmount: info.feeRate * fromAmount!,
              lpFeeFiatAmount: currencyToToken(from!, info.feeRate * fromAmount!)?.fiatAmount,
              routers: info.route.map(currencyToToken).filter(isNotNull),
              txToBroadcast: tx,
            };
            navigate('/swap-confirm', {
              state,
            });
          }
        : undefined,
  };
}

const noop = () => null;
const isNotNull = <T extends any>(t: T | null | undefined): t is T => t != null;
