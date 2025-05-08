import { checkIsDeployed } from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { constants } from 'starknet';

type Args = {
  onLoad: () => void;
  onIsDeployed: (address: string) => void;
  onIsNotDeployed: (address: string) => void;
  onError: (error: unknown) => void;
};

export function useCheckRecipientAccountDeployed({
  onLoad,
  onIsDeployed,
  onIsNotDeployed,
  onError,
}: Args) {
  const { mutate } = useMutation<boolean, Error, string>({
    mutationFn: async (address: string) => {
      const { isDeployed } = await checkIsDeployed({
        address,
        network: constants.NetworkName.SN_MAIN,
      });
      return isDeployed;
    },
    onMutate: onLoad,
    onSuccess: (isDeployed, address) => {
      if (isDeployed) {
        onIsDeployed(address);
      } else {
        onIsNotDeployed(address);
      }
    },
    onError,
  });

  return useCallback(
    (address: string) => {
      mutate(address);
    },
    [mutate],
  );
}
