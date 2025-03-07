import type {
  FungibleToken,
  FungibleTokenProtocol,
  Protocol,
  Quote,
  Token,
  TokenBasic,
} from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';

export const mapFtToCurrencyType = (ft?: FungibleToken): CurrencyTypes => {
  const principalToCurrencyTypeMap: Record<string, CurrencyTypes> = {
    BTC: 'BTC',
    STX: 'STX',
  };

  return ft ? principalToCurrencyTypeMap[ft.principal] ?? 'FT' : 'FT';
};

export const BAD_QUOTE_PERCENTAGE = 0.25;

export const mapFTProtocolToSwapProtocol = (ft: FungibleToken): Protocol => {
  if (ft.principal === 'BTC') return 'btc';
  if (ft.principal === 'STX') return 'stx';
  if (!ft.protocol) return 'runes';

  const protocolMap: Record<FungibleTokenProtocol, Protocol> = {
    stacks: 'sip10',
    runes: 'runes',
    'brc-20': 'brc20',
  };
  return protocolMap[ft.protocol];
};

export const mapFTMotherProtocolToSwapProtocol = (ft: FungibleToken): Protocol => {
  if (ft.principal === 'BTC') return 'runes';
  if (ft.principal === 'STX') return 'sip10';
  if (ft.protocol === 'stacks') return 'sip10';
  if (ft.protocol === 'runes') return 'runes';
  return 'runes';
};

const mapSwapProtocolToFTProtocol = (protocol: Protocol): FungibleTokenProtocol => {
  const protocolMap: Partial<Record<Protocol, FungibleTokenProtocol>> = {
    stx: 'stacks',
    btc: 'runes',
    sip10: 'stacks',
    runes: 'runes',
    brc20: 'brc-20',
  };
  return protocolMap[protocol] ?? 'runes';
};

export const mapSwapTokenToFT = (token: Token): FungibleToken => ({
  protocol: mapSwapProtocolToFTProtocol(token.protocol),
  ticker: token.symbol,
  name: token.name ?? token.ticker,
  assetName: token.name ?? token.ticker,
  principal: token.ticker,
  balance: '0',
  decimals: token.divisibility,
  image: token.logo,
  total_received: '0',
  total_sent: '0',
  runeSymbol: token.symbol,
  runeInscriptionId: token.logo,
});

export const mapFTNativeSwapTokenToTokenBasic = (token: FungibleToken): TokenBasic => ({
  ticker: token.principal,
  protocol: mapFTProtocolToSwapProtocol(token),
});

export const isRunesTx = ({
  fromToken,
  toToken,
}: {
  fromToken: FungibleToken;
  toToken: FungibleToken;
}): boolean =>
  (fromToken?.protocol === 'runes' || toToken?.protocol === 'runes') &&
  (fromToken?.principal === 'BTC' || toToken?.principal === 'BTC');

export const isStxTx = ({
  fromToken,
  toToken,
}: {
  fromToken?: FungibleToken;
  toToken?: FungibleToken;
}): boolean =>
  fromToken?.protocol === 'stacks' ||
  fromToken?.principal === 'STX' ||
  toToken?.protocol === 'stacks' ||
  toToken?.principal === 'STX';

export const isMotherToken = (token?: FungibleToken) => {
  const identifier = token?.principal;
  return identifier === 'BTC' || identifier === 'STX';
};

export const getTrackingIdentifier = (token?: FungibleToken): string => {
  if (!token) return '';

  const identifier = token.principal;

  if (isMotherToken(token)) {
    return identifier;
  }

  if (token.protocol === 'stacks') {
    return token.ticker || token.name || identifier;
  }

  return token.name || identifier;
};

export const getProviderDetails = (amm: Quote) => {
  if (amm.provider.code === 'satsterminal') {
    return {
      name: amm.bestMarketplaceProvider?.name ?? amm.provider.name,
      logo: amm.bestMarketplaceProvider?.logo ?? amm.provider.logo,
    };
  }
  return {
    name: amm.provider.name,
    logo: amm.provider.logo,
  };
};
