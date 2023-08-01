import { SwapToken } from '@screens/swap/useSwap';
import { Currency } from 'alex-sdk';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  broadcastSignedTransaction,
  signTransaction,
  StacksTransaction,
} from '@secretkeylabs/xverse-core';
import { deserializeTransaction } from '@stacks/transactions';
import useNetworkSelector from '@hooks/useNetwork';
import { useNavigate } from 'react-router-dom';
import useSponsoredTransaction from '@hooks/useSponsoredTransaction';
import { ApiResponseError } from '@secretkeylabs/xverse-core/types';
import { TokenImageProps } from '@components/tokenImage';
import { XVERSE_SPONSOR_2_URL } from '@utils/constants';

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
};

export type SwapConfirmationOutput = Omit<SwapConfirmationInput, 'unsignedTx'> & {
  onConfirm: () => Promise<void>;
  unsignedTx: StacksTransaction; // deserialized StacksTransaction
};

export function useConfirmSwap(input: SwapConfirmationInput): SwapConfirmationOutput {
  const { selectedAccount, seedPhrase } = useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const { isSponsored, sponsorTransaction } = useSponsoredTransaction(XVERSE_SPONSOR_2_URL);
  const navigate = useNavigate();
  const unsignedTx = deserializeTransaction(input.unsignedTx);

  return {
    ...input,
    lpFeeAmount: isSponsored ? 0 : input.lpFeeAmount,
    lpFeeFiatAmount: isSponsored ? 0 : input.lpFeeFiatAmount,
    unsignedTx,
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
        if (e instanceof Error) {
          navigate('/tx-status', {
            state: {
              txid: '',
              currency: 'STX',
              error: e instanceof ApiResponseError ? e.data.message : e.message,
              sponsored: isSponsored,
              browserTx: true,
            },
          });
        }
      }
    },
  };
}
