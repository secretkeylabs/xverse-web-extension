import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  getBrc20Tokens,
  getOrdinalsFtBalance,
  type Brc20Token,
  type FungibleToken,
  type FungibleTokenWithStates,
  type SettingsNetwork,
} from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { selectWithDerivedState } from '@utils/tokens';

const brc20TokenToFungibleToken = (coin: Brc20Token): FungibleToken => ({
  name: coin.name,
  principal: coin.ticker ?? coin.name,
  balance: '0',
  total_sent: '',
  total_received: '',
  assetName: coin.name ?? coin.ticker,
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
          priceChangePercentage24h: found.priceChangePercentage24h,
          currentPrice: found.currentPrice,
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

export const useGetBrc20FungibleTokens = (select?: (data: FungibleTokenWithStates[]) => any) => {
  const { ordinalsAddress } = useSelectedAccount();
  const { brc20ManageTokens, fiatCurrency, network, spamTokens, showSpamTokens } =
    useWalletSelector();

  const queryFn = fetchBrc20FungibleTokens(ordinalsAddress, fiatCurrency, network);

  return useQuery({
    queryKey: ['brc20-fungible-tokens', ordinalsAddress, network.type, fiatCurrency],
    queryFn,
    enabled: Boolean(network && ordinalsAddress),
    keepPreviousData: true,
    select: selectWithDerivedState({
      manageTokens: brc20ManageTokens,
      spamTokens,
      showSpamTokens,
      select,
    }),
  });
};

// convenience hook to get only enabled brc20 fungible tokens
export const useVisibleBrc20FungibleTokens = () => {
  const selectEnabled = (data: FungibleTokenWithStates[]) => data.filter((ft) => ft.isEnabled);
  return useGetBrc20FungibleTokens(selectEnabled);
};
