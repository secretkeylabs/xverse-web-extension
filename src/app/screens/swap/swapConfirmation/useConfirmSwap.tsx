import { TokenImageProps } from '@components/tokenImage';
import useNetworkSelector from '@hooks/useNetwork';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import { SwapToken } from '@screens/swap/types';
import {
  ApiResponseError,
  broadcastSignedTransaction,
  microstacksToStx,
  signTransaction,
  StacksTransaction,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction } from '@stacks/transactions';
import { Currency, SponsoredTxError, SponsoredTxErrorCode } from 'alex-sdk';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlexSponsoredTransaction } from '../useAlexSponsoredTransaction';
import { useCurrencyConversion } from '../useCurrencyConversion';

export type SwapConfirmationInput = {
  from: Currency;
  to: Currency;
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: number;
  minToAmount: number;
  txFeeAmount: number;
  txFeeFiatAmount?: number;
  address: string;
  routers: { image: TokenImageProps; name: string }[];
  unsignedTx: string; // serialized hex StacksTransaction
  functionName: string;
  userOverrideSponsorValue: boolean;
};

export type SwapConfirmationOutput = Omit<SwapConfirmationInput, 'unsignedTx'> & {
  onConfirm: () => Promise<void>;
  onFeeUpdate: (settingFee: bigint) => void;
  unsignedTx: StacksTransaction; // deserialized StacksTransaction
  isSponsored: boolean;
  isSponsorDisabled: boolean;
};

export function useConfirmSwap(input: SwapConfirmationInput): SwapConfirmationOutput {
  const { selectedAccount } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const { isSponsored, sponsorTransaction, isSponsorDisabled } = useAlexSponsoredTransaction(
    input.userOverrideSponsorValue,
  );
  const { currencyToToken } = useCurrencyConversion();
  const { getSeed } = useSeedVault();
  const navigate = useNavigate();
  const [unsignedTx, setUnsignedTx] = useState<StacksTransaction>(
    deserializeTransaction(input.unsignedTx),
  );
  const [feeAmount, setFeeAmount] = useState(input.txFeeAmount);
  const [feeFiatAmount, setFeeFiatAmount] = useState(input.txFeeFiatAmount);

  return {
    ...input,
    txFeeAmount: feeAmount,
    txFeeFiatAmount: feeFiatAmount,
    unsignedTx,
    userOverrideSponsorValue: input.userOverrideSponsorValue,
    onFeeUpdate: (settingFee: bigint) => {
      const fee = microstacksToStx(new BigNumber(settingFee.toString()));
      unsignedTx.setFee(settingFee);
      setUnsignedTx(unsignedTx);
      setFeeAmount(Number(fee));
      setFeeFiatAmount(currencyToToken(Currency.STX, Number(fee))?.fiatAmount);
    },
    isSponsored,
    isSponsorDisabled,
    onConfirm: async () => {
      const seedPhrase = await getSeed();
      const signed = await signTransaction(
        unsignedTx,
        seedPhrase,
        selectedAccount?.id ?? 0,
        selectedNetwork,
      );
      try {
        let broadcastResult: string;
        if (isSponsored) {
          broadcastResult = await sponsorTransaction(signed);
        } else {
          broadcastResult = await broadcastSignedTransaction(signed, selectedNetwork);
        }
        if (broadcastResult) {
          navigate('/tx-status', {
            state: {
              txid: broadcastResult,
              currency: 'STX',
              error: '',
              sponsored: isSponsored,
              browserTx: true,
            },
          });
        }
      } catch (e) {
        if (e instanceof SponsoredTxError) {
          navigate('/tx-status', {
            state: {
              txid: '',
              currency: 'STX',
              error:
                e.code !== SponsoredTxErrorCode.unknown_error ? e.message : 'Unknown sponsor error',
              sponsored: isSponsored,
              browserTx: true,
              isSponsorServiceError: true,
              isSwapTransaction: true,
            },
          });
        } else if (e instanceof Error) {
          navigate('/tx-status', {
            state: {
              txid: '',
              currency: 'STX',
              error: e instanceof ApiResponseError ? e.data.message : e.message,
              sponsored: isSponsored,
              browserTx: true,
              isSwapTransaction: true,
            },
          });
        }
      }
    },
  };
}
