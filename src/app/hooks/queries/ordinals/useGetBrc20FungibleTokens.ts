import useWalletSelector from '@hooks/useWalletSelector';
import {
  Brc20Token,
  FungibleToken,
  SettingsNetwork,
  getBrc20Tokens,
  getOrdinalsFtBalance,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const brc20TokenToFungibleToken = (coin: Brc20Token): FungibleToken => ({
  name: coin.name,
  principal: coin.ticker ?? coin.name,
  balance: '0',
  total_sent: '',
  total_received: '',
  assetName: coin.name ?? coin.ticker,
  visible: true,
  ticker: coin.ticker,
  protocol: 'brc-20',
  supported: coin.supported,
});

export const fetchBrc20FungibleTokens =
  (ordinalsAddress: string, fiatCurrency: string, network: SettingsNetwork) => async () => {
    // get brc20 balances for the ordinalsAddress
    const ordinalsFtBalance: FungibleToken[] = (
      await getOrdinalsFtBalance(network.type, ordinalsAddress)
    ).map((ft) => ({ ...ft, ticker: ft.ticker?.toUpperCase() }));

    // get extra metadata (tokenFiatRate) including supported tokens without balance
    const tickers = ordinalsFtBalance.filter((ft) => ft.ticker).map((ft) => ft.ticker!) ?? [];
    const brc20Tokens = (await getBrc20Tokens(network.type, tickers, fiatCurrency)) || [];

    // combine the two, into a unique list of fungible tokens
    return ordinalsFtBalance
      .map((ft) => {
        const found = brc20Tokens.find((coin) => coin.ticker === ft.ticker);
        if (!found) {
          return ft;
        }
        return {
          ...ft,
          tokenFiatRate: Number(found.tokenFiatRate),
          name: found.name,
        };
      })
      .concat(
        brc20Tokens
          .filter((coin) => !ordinalsFtBalance.some((ft) => ft.ticker === coin.ticker))
          .map((coin) => brc20TokenToFungibleToken(coin)),
      );
  };

export const useGetBrc20FungibleTokens = () => {
  const { ordinalsAddress, fiatCurrency, network } = useWalletSelector();
  const queryFn = fetchBrc20FungibleTokens(ordinalsAddress, fiatCurrency, network);

  return useQuery({
    queryKey: ['brc20-fungible-tokens', ordinalsAddress, network.type, fiatCurrency],
    queryFn,
    enabled: Boolean(network && ordinalsAddress),
  });
};

export const useVisibleBrc20FungibleTokens = (): ReturnType<typeof useGetBrc20FungibleTokens> & {
  visible: FungibleToken[];
} => {
  const { brc20ManageTokens } = useWalletSelector();
  const brc20Query = useGetBrc20FungibleTokens();
  return {
    ...brc20Query,
    visible: (brc20Query.data ?? []).filter((ft) => {
      const userSetting = brc20ManageTokens[ft.principal];
      return userSetting === true || (userSetting === undefined && new BigNumber(ft.balance).gt(0));
    }),
  };
};
