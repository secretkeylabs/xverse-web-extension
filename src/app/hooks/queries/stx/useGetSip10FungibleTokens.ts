import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  FungibleToken,
  SettingsNetwork,
  StacksNetwork,
  // getCoinMetaData,
  getCoinsInfo,
  getFtData,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const fetchSip10FungibleTokens =
  (
    stxAddress: string,
    fiatCurrency: string,
    network: SettingsNetwork,
    currentNetworkInstance: StacksNetwork,
  ) =>
  async () => {
    // get sip10 metadata and balances for the stxAddress
    const sip10Balances = await getFtData(stxAddress, currentNetworkInstance);

    // getting contract ids of all fts
    const contractids: string[] = sip10Balances.map((ft) => ft.principal);
    const sip10ContractInfos = (await getCoinsInfo(network.type, contractids, fiatCurrency)) || [];

    // combine
    return sip10Balances
      .map((ft) => {
        const found = (sip10ContractInfos || []).find((coin) => coin.contract === ft.principal);
        if (!found) {
          return ft;
        }
        return {
          ...ft,
          ...found,
          visible: true,
          name: found.name || ft.principal.split('.')[1],
        };
      })
      .concat(
        sip10ContractInfos
          .filter((coin) => !sip10Balances.some((ft) => ft.principal === coin.contract))
          .map((coin) => ({
            ...coin,
            principal: coin.contract,
            assetName: coin.name || coin.contract.split('.')[1],
            protocol: 'stacks',
            balance: '0',
            total_sent: '',
            total_received: '',
          })),
      );
  };

export const useGetSip10FungibleTokens = () => {
  const { stxAddress, fiatCurrency, network } = useWalletSelector();
  const currentNetworkInstance = useNetworkSelector();

  const queryFn = fetchSip10FungibleTokens(
    stxAddress,
    fiatCurrency,
    network,
    currentNetworkInstance,
  );

  return useQuery({
    queryKey: ['sip10-fungible-tokens', network.type, stxAddress, fiatCurrency],
    queryFn,
    enabled: Boolean(network && stxAddress),
  });
};

export const useVisibleSip10FungibleTokens = (): ReturnType<typeof useGetSip10FungibleTokens> & {
  visible: FungibleToken[];
} => {
  const { sip10ManageTokens } = useWalletSelector();
  const sip10Query = useGetSip10FungibleTokens();
  return {
    ...sip10Query,
    visible: (sip10Query.data ?? []).filter((ft) => {
      const userSetting = sip10ManageTokens[ft.principal];
      return userSetting === true || (userSetting === undefined && new BigNumber(ft.balance).gt(0));
    }),
  };
};
