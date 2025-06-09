import useXverseApi from '@hooks/apiClients/useXverseApi';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  getFtData,
  type FungibleToken,
  type FungibleTokenWithStates,
  type SettingsNetwork,
  type StacksNetwork,
} from '@secretkeylabs/xverse-core';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { selectWithDerivedState } from '@utils/tokens';

export const fetchSip10FungibleTokens =
  (
    stxAddress: string,
    fiatCurrency: string,
    network: SettingsNetwork,
    currentNetworkInstance: StacksNetwork,
    xverseApiClient,
  ): (() => Promise<FungibleToken[]>) =>
  async () => {
    const sip10Balances = await getFtData(stxAddress, currentNetworkInstance);
    const sip10ContractInfos =
      (await xverseApiClient.getSip10Tokens(
        sip10Balances.map((ft) => ft.principal),
        fiatCurrency,
      )) || [];

    return sip10Balances.map((ft) => {
      const found = sip10ContractInfos.find((coin) => coin.contract === ft.principal);
      if (!found) {
        return ft;
      }
      return {
        ...ft,
        ...found,
        name: found.name || ft.principal.split('.')[1],
      };
    });
  };

export const useGetSip10FungibleTokens = (select?: (data: FungibleTokenWithStates[]) => any) => {
  const { stxAddress } = useSelectedAccount();
  const { sip10ManageTokens, fiatCurrency, network, spamTokens, showSpamTokens } =
    useWalletSelector();
  const currentNetworkInstance = useNetworkSelector();
  const xverseApiClient = useXverseApi();

  const queryFn = fetchSip10FungibleTokens(
    stxAddress,
    fiatCurrency,
    network,
    currentNetworkInstance,
    xverseApiClient,
  );

  return useQuery({
    queryKey: ['sip10-fungible-tokens', network.type, stxAddress, fiatCurrency],
    queryFn,
    enabled: Boolean(network && stxAddress),
    placeholderData: keepPreviousData,
    select: selectWithDerivedState({
      manageTokens: sip10ManageTokens,
      spamTokens,
      showSpamTokens,
      select,
    }),
  });
};

// convenience hook to get only enabled sip10 fungible tokens
export const useVisibleSip10FungibleTokens = () => {
  const selectEnabled = (data: FungibleTokenWithStates[]) => data.filter((ft) => ft.isEnabled);
  return useGetSip10FungibleTokens(selectEnabled);
};
