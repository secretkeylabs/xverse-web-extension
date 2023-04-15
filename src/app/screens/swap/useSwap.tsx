import { ReactNode } from 'react';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import useWalletSelector from '@hooks/useWalletSelector';
import TokenImage from '@components/tokenImage';
import { LoaderSize } from '@utils/constants';

// function tokenName(coin: SelectedToken) {
//   if (coin.type === 'STX') {
//     return coin.type;
//   }
//   return coin.token.ticker?.toUpperCase() ?? coin.token.name.toUpperCase();
// }
//
// function balance(coin: SelectedToken) {
//   if (coin.type === 'STX') {
//     return Number(microstacksToStx(coin.balance as any));
//   }
//   if (coin.token.decimals) {
//     return ftDecimals(coin.token.balance, coin.token.decimals);
//   }
//   return coin.token.balance;
// }

export type SwapToken = {
  name: string;
  image: ReactNode;
  balance: number;
  amount: number;
  fiatAmount: number;
};

export type UseSwap = {
  coinsList: FungibleToken[];
  isLoadingWalletData: boolean;
  selectedFromToken?: SwapToken;
  selectedToToken?: SwapToken;
  onSelectFromToken: (token: 'STX' | FungibleToken) => void;
  onSelectToToken: (token: 'STX' | FungibleToken) => void;
  inputAmount: string;
  inputAmountInvalid?: boolean;
  onInputAmountChanged: (amount: string) => void;
  submitError?: string;
  swapInfo?: {
    exchangeRate: string;
    lpFee: string;
    route: string;
  };
  slippage: number;
  onSlippageChanged: (slippage: number) => void;
  minReceived?: string;
};

export function useSwap(): UseSwap {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const { coinsList, stxAvailableBalance } = useWalletSelector();

  return {
    coinsList: coinsList ?? [],
    isLoadingWalletData: false,
    onInputAmountChanged: noop,
    selectedFromToken: {
      amount: 123,
      fiatAmount: 12312,
      balance: 321,
      image: <TokenImage token="STX" size={28} loaderSize={LoaderSize.SMALL} />,
      name: 'STX',
    },
    selectedToToken: {
      amount: 123,
      fiatAmount: 12312,
      balance: 321,
      image: <TokenImage token="STX" size={28} loaderSize={LoaderSize.SMALL} />,
      name: 'STX',
    },
    inputAmount: '123',
    slippage: 0.03,
    onSelectFromToken: noop,
    onSelectToToken: noop,
    inputAmountInvalid: true,
    onSlippageChanged: noop,
  };
}

const noop = () => null;
