import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import { getCoinMetaData } from '@secretkeylabs/xverse-core';
import { getCoinsInfo, getFtData } from '@secretkeylabs/xverse-core/api';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';
import { setCoinDataAction } from '@stores/wallet/actions/actionCreators';
import { useQuery } from '@tanstack/react-query';
import { handleRetries, InvalidParamsError } from '@utils/query';
import { useDispatch } from 'react-redux';

export const useCoinsData = () => {
  const dispatch = useDispatch();
  const { stxAddress, coinsList, fiatCurrency, network } = useWalletSelector();
  const currentNetworkInstance = useNetworkSelector();

  const fetchCoinData = async () => {
    try {
      if (!stxAddress) {
        throw new InvalidParamsError('No stx address');
      }

      const fungibleTokenList: Array<FungibleToken> = await getFtData(
        stxAddress,
        currentNetworkInstance,
      );
      const visibleCoins: FungibleToken[] | null = coinsList;
      if (visibleCoins) {
        visibleCoins.forEach((visibleCoin) => {
          const coinToBeUpdated = fungibleTokenList.find(
            (ft) => ft.principal === visibleCoin.principal,
          );
          if (coinToBeUpdated) coinToBeUpdated.visible = visibleCoin.visible;
          else if (visibleCoin.visible) {
            visibleCoin.balance = '0';
            fungibleTokenList.push(visibleCoin);
          }
        });
      } else {
        fungibleTokenList.forEach((ft) => {
          ft.visible = true;
        });
      }

      const contractids: string[] = [];
      // getting contract ids of all fts
      fungibleTokenList.forEach((ft) => {
        contractids.push(ft.principal);
      });
      let coinsResponse = await getCoinsInfo(network.type, contractids, fiatCurrency);
      if (!coinsResponse) {
        coinsResponse = await getCoinMetaData(contractids, currentNetworkInstance);
      }

      coinsResponse.forEach((coin) => {
        if (!coin.name) {
          const coinName = coin.contract.split('.')[1];
          coin.name = coinName;
        }
      });

      // update attributes of fungible token list
      fungibleTokenList.forEach((ft) => {
        coinsResponse!.forEach((coin) => {
          if (ft.principal === coin.contract) {
            ft.ticker = coin.ticker;
            ft.decimals = coin.decimals;
            ft.supported = coin.supported;
            ft.image = coin.image;
            ft.name = coin.name;
            ft.tokenFiatRate = coin.tokenFiatRate;
            coin.visible = ft.visible;
          }
        });
      });

      // sorting the list - moving supported to the top
      const supportedFts: FungibleToken[] = [];
      const unSupportedFts: FungibleToken[] = [];
      fungibleTokenList.forEach((ft) => {
        if (ft.supported) supportedFts.push(ft);
        else unSupportedFts.push(ft);
      });
      const sortedFtList: FungibleToken[] = [...supportedFts, ...unSupportedFts];
      dispatch(setCoinDataAction(sortedFtList, coinsResponse));
      return { sortedFtList, coinsResponse };
    } catch (error: any) {
      return Promise.reject(error);
    }
  };

  return useQuery({
    queryKey: ['coins_data'],
    queryFn: fetchCoinData,
    retry: handleRetries,
  });
};

export default useCoinsData;
