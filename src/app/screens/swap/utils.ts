import type {
  FungibleToken,
  FungibleTokenProtocol,
  Protocol,
  Token,
} from '@secretkeylabs/xverse-core';

export const mapFTProtocolToSwapProtocol = (protocol: FungibleTokenProtocol): Protocol => {
  const protocolMap: Record<FungibleTokenProtocol, Protocol> = {
    stacks: 'sip10',
    runes: 'runes',
    'brc-20': 'brc20',
  };
  return protocolMap[protocol];
};

const mapSwapProtocolToFTProtocol = (protocol: Protocol): FungibleTokenProtocol => {
  const protocolMap: Partial<Record<Protocol, FungibleTokenProtocol>> = {
    sip10: 'stacks',
    runes: 'runes',
    brc20: 'brc-20',
  };
  return protocolMap[protocol] ?? 'runes';
};

export const mapSwapTokenToFungibleToken = (token: Token): FungibleToken => ({
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
