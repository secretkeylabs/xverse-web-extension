import { useEffect, useState } from 'react';
import {
  FungibleToken,
  getNewNonce,
  microstacksToStx,
  setNonce,
  getNonce,
} from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import { TokenImageProps } from '@components/tokenImage';
import { LoaderSize } from '@utils/constants';
import { AlexSDK, Currency } from 'alex-sdk';
import { ftDecimals } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { getFiatEquivalent } from '@secretkeylabs/xverse-core/transactions';
import { useNavigate } from 'react-router-dom';
import { SwapConfirmationInput } from '@screens/swap/swapConfirmation/useConfirmSwap';
import { AnchorMode, makeUnsignedContractCall, PostConditionMode } from '@stacks/transactions';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import { useAlexSponsoredTransaction } from './useAlexSponsoredTransaction';

const isNotNull = <T extends any>(t: T | null | undefined): t is T => t != null;

export type STXOrFungibleToken = 'STX' | FungibleToken;
export type Side = 'from' | 'to';

export type SwapToken = {
  name: string;
  image: TokenImageProps;
  balance?: number;
  amount?: number;
  fiatAmount?: number;
};

export type UseSwap = {
  coinsList: FungibleToken[];
  isLoadingWalletData: boolean;
  selectedFromToken?: SwapToken;
  selectedToToken?: SwapToken;
  onSelectToken: (token: STXOrFungibleToken, side: Side) => void;
  inputAmount: string;
  inputAmountInvalid?: boolean;
  onInputAmountChanged: (amount: string) => void;
  handleClickDownArrow: (event: React.MouseEvent<HTMLButtonElement>) => void;
  submitError?: string;
  swapInfo?: {
    exchangeRate?: string;
    lpFee?: string;
    route?: string;
  };
  slippage: number;
  onSlippageChanged: (slippage: number) => void;
  minReceived?: string;
  onSwap?: () => Promise<void>;
  isSponsored: boolean;
  isServiceRunning: boolean;
  toggleUserOverrideSponsorValue: () => void;
};

export type SelectedCurrencyState = {
  to?: Currency;
  from?: Currency;
  prevTo?: Currency;
  prevFrom?: Currency;
};

function updateOppositeCurrencyIfSameAsSelected(
  state: SelectedCurrencyState,
  { newCurrency, side },
) {
  switch (side) {
    case 'from':
      if (state.to !== newCurrency) {
        return state.to;
      }
      if (state.to === newCurrency && state.prevTo !== newCurrency) {
        return state.prevTo;
      }
      return undefined;
    case 'to':
      if (state.from !== newCurrency) {
        return state.from;
      }
      if (state.from === newCurrency && state.prevFrom !== newCurrency) {
        return state.prevFrom;
      }
      return undefined;
    default:
      return state.to;
  }
}

export const selectedTokenReducer: (
  state: SelectedCurrencyState,
  { newCurrency, side }: { newCurrency: Currency; side: Side },
) => SelectedCurrencyState = (state, { newCurrency, side }) => {
  switch (side) {
    case 'from':
      return {
        ...state,
        prevFrom: state.from,
        from: newCurrency,
        to: updateOppositeCurrencyIfSameAsSelected(state, { newCurrency, side }),
      };
    case 'to':
      return {
        ...state,
        prevTo: state.to,
        to: newCurrency,
        from: updateOppositeCurrencyIfSameAsSelected(state, { newCurrency, side }),
      };
    default:
      return state;
  }
};

export function useSwap(): UseSwap {
  const navigate = useNavigate();
  const alexSDK = useState(() => new AlexSDK())[0];
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const {
    coins: supportedCoins = [],
    coinsList: visibleCoins = [],
    stxAvailableBalance,
    stxBtcRate,
    btcFiatRate,
    stxAddress,
    stxPublicKey,
  } = useWalletSelector();
  const [userOverrideSponsorValue, setUserOverrideSponsorValue] = useState(true);
  const { isSponsored, isServiceRunning } = useAlexSponsoredTransaction(userOverrideSponsorValue);
  const { data: stxPendingTxData } = useStxPendingTxData();

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

  const [inputAmount, setInputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.04);
  const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrencyState>({
    to: undefined,
    from: undefined,
    prevTo: undefined,
    prevFrom: undefined,
  });

  const fromAmount = Number.isNaN(Number(inputAmount)) ? undefined : Number(inputAmount);

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

  function getCurrencyName(currency: Currency) {
    if (currency === Currency.STX) {
      return 'STX';
    }
    const token = acceptableCoinList.find(
      (c) => alexSDK.getCurrencyFrom(c.principal) === currency,
    )!;
    if (token == null) {
      return currency;
    }
    return (token.ticker ?? token.name).toUpperCase();
  }

  function getCurrencyFromToken(token: 'STX' | FungibleToken) {
    return token === 'STX' ? Currency.STX : alexSDK.getCurrencyFrom(token.principal)!;
  }

  function onSelectToken(token: STXOrFungibleToken, side: Side) {
    const newCurrency = getCurrencyFromToken(token);
    setSelectedCurrency(selectedTokenReducer(selectedCurrency, { newCurrency, side }));
  }

  const fromToken = currencyToToken(selectedCurrency.from, fromAmount);
  const inputAmountInvalid =
    Number.isNaN(Number(inputAmount)) ||
    (fromAmount != null &&
      (fromAmount < 0 || (fromToken?.balance != null && fromToken.balance < fromAmount)));

  const [info, setInfo] = useState<{
    route: Currency[];
    feeRate: number;
  }>();

  useEffect(() => {
    if (
      selectedCurrency.from == null ||
      selectedCurrency.to == null ||
      selectedCurrency.from === selectedCurrency.to
    ) {
      setInfo(undefined);
    } else {
      let cancelled = false;
      Promise.all([
        alexSDK.getFeeRate(selectedCurrency.from, selectedCurrency.to),
        alexSDK.getRouter(selectedCurrency.from, selectedCurrency.to),
      ]).then((a) => {
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
  }, [selectedCurrency.from, selectedCurrency.to, alexSDK]);

  const [exchangeRate, setExchangeRate] = useState<number>();

  useEffect(() => {
    if (
      selectedCurrency.from == null ||
      selectedCurrency.to == null ||
      fromAmount == null ||
      fromAmount === 0 ||
      selectedCurrency.from === selectedCurrency.to
    ) {
      setExchangeRate(undefined);
    } else {
      let cancelled = false;
      alexSDK
        .getAmountTo(
          selectedCurrency.from,
          BigInt(Math.floor(fromAmount * 1e8)),
          selectedCurrency.to,
        )
        .then((result) => {
          if (cancelled) {
            return;
          }
          setExchangeRate(Number(result) / 1e8 / fromAmount);
        });
      return () => {
        cancelled = true;
      };
    }
  }, [selectedCurrency.from, selectedCurrency.to, fromAmount, alexSDK]);

  function roundForDisplay(input?: number) {
    if (input == null) {
      return undefined;
    }
    return input.toFixed(4);
  }

  const toAmount =
    exchangeRate != null && fromAmount != null ? fromAmount * exchangeRate : undefined;

  function toggleFromToTokens() {
    setSelectedCurrency((prevState) => ({
      to: prevState.from,
      from: prevState.to,
    }));
    if (toAmount) {
      setInputAmount(String(toAmount));
    }
  }

  const toToken = currencyToToken(selectedCurrency.to, toAmount);
  return {
    coinsList: acceptableCoinList,
    isLoadingWalletData: false,
    inputAmount,
    onInputAmountChanged: setInputAmount,
    selectedFromToken: fromToken,
    selectedToToken: toToken,
    slippage,
    onSlippageChanged: setSlippage,
    onSelectToken,
    inputAmountInvalid,
    handleClickDownArrow: toggleFromToTokens,
    minReceived:
      toAmount != null
        ? `${roundForDisplay(toAmount * (1 - slippage))} ${toToken?.name}`
        : undefined,
    swapInfo: {
      exchangeRate:
        exchangeRate != null && fromToken != null && toToken != null
          ? `1 ${fromToken.name} = ${roundForDisplay(exchangeRate)} ${toToken.name}`
          : undefined,
      route: info?.route.map(getCurrencyName).join(' \u2192 '),
      lpFee:
        info?.feeRate != null && fromAmount != null && fromToken != null
          ? `${roundForDisplay(info.feeRate * fromAmount)} ${fromToken.name}`
          : undefined,
    },
    submitError: inputAmountInvalid ? t('ERRORS.INSUFFICIENT_BALANCE_FEES') : undefined,
    onSwap:
      fromAmount != null &&
      toAmount != null &&
      selectedCurrency.from != null &&
      selectedCurrency.to != null &&
      info != null
        ? async () => {
            const tx = alexSDK.runSwap(
              stxAddress,
              selectedCurrency.from!,
              selectedCurrency.to!,
              BigInt(Math.floor(fromAmount * 1e8)),
              BigInt(Math.floor(toAmount * (1 - slippage) * 1e8)),
              info.route,
            );
            const unsignedTx = await makeUnsignedContractCall({
              publicKey: stxPublicKey,
              contractAddress: tx.contractAddress,
              contractName: tx.contractName,
              functionName: tx.functionName,
              functionArgs: tx.functionArgs as any,
              anchorMode: AnchorMode.Any,
              postConditionMode: PostConditionMode.Deny,
              postConditions: tx.postConditions,
              sponsored: isSponsored,
            });

            // bump nonce if pendingTxs
            setNonce(
              unsignedTx,
              getNewNonce(stxPendingTxData?.pendingTransactions || [], getNonce(unsignedTx)),
            );
            const fee = microstacksToStx(
              new BigNumber(unsignedTx.auth.spendingCondition.fee.toString()),
            ).toNumber();
            const state: SwapConfirmationInput = {
              from: selectedCurrency.from!,
              to: selectedCurrency.to!,
              fromToken: fromToken!,
              toToken: toToken!,
              address: stxAddress,
              fromAmount: fromAmount!,
              minToAmount: toAmount! * (1 - slippage),
              lpFeeAmount: fee,
              lpFeeFiatAmount: currencyToToken(selectedCurrency.from!, fee)?.fiatAmount,
              routers: info.route.map(currencyToToken).filter(isNotNull),
              unsignedTx: unsignedTx.serialize().toString('hex'),
              functionName: `${tx.contractName}\n${tx.functionName}`,
              userOverrideSponsorValue,
            };
            navigate('/swap-confirm', {
              state,
            });
          }
        : undefined,
    isSponsored,
    isServiceRunning,
    toggleUserOverrideSponsorValue: () => {
      setUserOverrideSponsorValue((prevValue) => !prevValue);
    },
  };
}
