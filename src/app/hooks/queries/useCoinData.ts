import useWalletSelector from '@hooks/useWalletSelector';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { CoinsResponse, FungibleToken } from '@secretkeylabs/xverse-core/types';
import { getCoinsInfo, getFtData } from '@secretkeylabs/xverse-core/api';
import useNetworkSelector from '@hooks/useNetwork';
import { setCoinDataAction } from '@stores/wallet/actions/actionCreators';
import { getCoinMetaData } from '@secretkeylabs/xverse-core';
import { InvalidParamsError, handleRetries } from '@utils/query';

export const useCoinsData = () => {
  const dispatch = useDispatch();
  const { stxAddress, coinsList, fiatCurrency } = useWalletSelector();
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
      let coinsReponse: CoinsResponse = await getCoinsInfo(contractids, fiatCurrency);
      if (!coinsReponse) {
        coinsReponse = await getCoinMetaData(contractids, currentNetworkInstance);
      }

      coinsReponse.forEach((coin) => {
        if (!coin.name) {
          const coinName = coin.contract.split('.')[1];
          coin.name = coinName;
        }
      });

      // update attributes of fungible token list
      fungibleTokenList.forEach((ft) => {
        coinsReponse.forEach((coin) => {
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
      dispatch(setCoinDataAction(sortedFtList, coinsReponse));
      return { sortedFtList, coinsReponse };
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
