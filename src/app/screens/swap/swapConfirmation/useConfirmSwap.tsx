import { Currency, SponsoredTxErrorCode, SponsoredTxError } from 'alex-sdk';
import { useNavigate } from 'react-router-dom';
import { SwapToken } from '@screens/swap/useSwap';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  broadcastSignedTransaction,
  signTransaction,
  StacksTransaction,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction } from '@stacks/transactions';
import useNetworkSelector from '@hooks/useNetwork';
import { ApiResponseError } from '@secretkeylabs/xverse-core/types';
import { TokenImageProps } from '@components/tokenImage';
import { useAlexSponsoredTransaction } from '../useAlexSponsoredTransaction';

export type SwapConfirmationInput = {
  from: Currency;
  to: Currency;
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: number;
  minToAmount: number;
  lpFeeAmount: number;
  lpFeeFiatAmount?: number;
  address: string;
  routers: { image: TokenImageProps; name: string }[];
  unsignedTx: string; // serialized hex StacksTransaction
  functionName: string;
  userOverrideSponsorValue: boolean;
};

export type SwapConfirmationOutput = Omit<SwapConfirmationInput, 'unsignedTx'> & {
  onConfirm: () => Promise<void>;
  unsignedTx: StacksTransaction; // deserialized StacksTransaction
};

export function useConfirmSwap(input: SwapConfirmationInput): SwapConfirmationOutput {
  const { selectedAccount, seedPhrase } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const { isSponsored, sponsorTransaction } = useAlexSponsoredTransaction(
    input.userOverrideSponsorValue,
  );
  const navigate = useNavigate();
  const unsignedTx = deserializeTransaction(input.unsignedTx);

  return {
    ...input,
    lpFeeAmount: isSponsored ? 0 : input.lpFeeAmount,
    lpFeeFiatAmount: isSponsored ? 0 : input.lpFeeFiatAmount,
    unsignedTx,
    userOverrideSponsorValue: input.userOverrideSponsorValue,
    onConfirm: async () => {
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
