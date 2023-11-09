import { TokenImageProps } from '@components/tokenImage';
import { FungibleToken } from '@secretkeylabs/xverse-core';
import { Currency } from 'alex-sdk';

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
  handleChangeUserOverrideSponsorValue: (checked: boolean) => void;
  isSponsorDisabled: boolean;
};

export type SelectedCurrencyState = {
  to?: Currency;
  from?: Currency;
  prevTo?: Currency;
  prevFrom?: Currency;
};
