import type {
  FungibleToken,
  FungibleTokenProtocol,
  Protocol,
  Token,
  TokenBasic,
} from '@secretkeylabs/xverse-core';

export const BAD_QUOTE_PERCENTAGE = 0.25;

export const mapFTProtocolToSwapProtocol = (protocol: FungibleTokenProtocol): Protocol => {
  const protocolMap: Record<FungibleTokenProtocol, Protocol> = {
    stacks: 'sip10',
    runes: 'runes',
    'brc-20': 'brc20',
  };
  return protocolMap[protocol];
};

export const mapSwapProtocolToFTProtocol = (protocol: Protocol): FungibleTokenProtocol => {
  const protocolMap: Partial<Record<Protocol, FungibleTokenProtocol>> = {
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
  image: undefined,
  total_received: '0',
  total_sent: '0',
  runeSymbol: token.symbol,
  runeInscriptionId: token.logo,
});

export const mapFTNativeSwapTokenToTokenBasic = (
  token: FungibleToken | 'BTC' | Token,
): TokenBasic => {
  if (token === 'BTC') {
    return { ticker: 'BTC', protocol: 'btc' };
  }

  // if token is FungibleToken
  if ('principal' in token && token.protocol) {
    return { ticker: token.principal, protocol: mapFTProtocolToSwapProtocol(token.protocol) };
  }

  // token will never have a principal prop so we can safely cast it as Token
  const safeTypeToken = token as Token;
  return { ticker: safeTypeToken.ticker, protocol: safeTypeToken.protocol };
};
