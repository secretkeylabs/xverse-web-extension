import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  submitTransfer,
  type Args as MutationFnArgs,
  type TransactionHash,
} from './components/reviewTransaction/utils';

type Args = {
  onIsLoading: () => void;
  onSuccess: (transactionHash: TransactionHash) => void;
  onError: (error: unknown) => void;
};

export function useSendTransaction({ onIsLoading, onSuccess, onError }: Args) {
  const { mutate } = useMutation<TransactionHash, Error, MutationFnArgs>({
    mutationFn: submitTransfer,
    onMutate: onIsLoading,
    onSuccess,
    onError,
  });

  return useCallback(
    (args: MutationFnArgs) => {
      mutate(args);
    },
    [mutate],
  );
}
