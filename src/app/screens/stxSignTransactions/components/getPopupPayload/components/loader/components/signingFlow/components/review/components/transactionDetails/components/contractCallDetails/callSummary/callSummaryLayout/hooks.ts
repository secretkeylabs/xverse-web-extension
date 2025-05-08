import useNetworkSelector from '@hooks/useNetwork';
import { getContractInterface } from '@secretkeylabs/xverse-core';
import type { ClarityAbiFunction } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

type UseFunctionInterfaceArgs = {
  contractPrincipal: string;
  functionName: string;
};
export function useFunctionInterface({
  contractPrincipal,
  functionName,
}: UseFunctionInterfaceArgs) {
  const selectedNetwork = useNetworkSelector();
  const contractInterfaceQuery = useQuery({
    queryKey: ['contract-interface', contractPrincipal, selectedNetwork],
    queryFn: async () =>
      // TODO: Use `stacksRpcApi.smartContracts.contractInterface` from
      // `stacks-tools` when this repo has been updated to `@stacks.js/*` v7.
      getContractInterface(
        contractPrincipal.split('.')[0],
        contractPrincipal.split('.')[1],
        selectedNetwork,
      ),
    gcTime: Infinity,
  });

  const functionInterface = useMemo(
    () => contractInterfaceQuery.data?.functions.find((func) => func.name === functionName),
    [contractInterfaceQuery.data, functionName],
  ) as ClarityAbiFunction | undefined | null; // TODO: remove this `as` when this repo has been updated to `@stacks.js/*` v7.

  return functionInterface;
}
