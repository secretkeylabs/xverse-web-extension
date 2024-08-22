import type {
  FungibleToken,
  FungibleTokenProtocol,
  Protocol,
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

export const mapTokenToCurrencyType = (t?: Token): CurrencyTypes => {
  const protocolToCurrencyTypeMap: Record<string, CurrencyTypes> = {
    btc: 'BTC',
    stx: 'STX',
  };

  return t ? protocolToCurrencyTypeMap[t.protocol] ?? 'FT' : 'FT';
};

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
  image: token.logo,
  total_received: '0',
  total_sent: '0',
  runeSymbol: token.symbol,
  runeInscriptionId: token.logo,
});

export const mapFTNativeSwapTokenToTokenBasic = (token: FungibleToken | Token): TokenBasic => {
  // if token is FungibleToken
  if ('principal' in token) {
    return { ticker: token.principal, protocol: mapFTProtocolToSwapProtocol(token) };
  }

  // token will never have a principal prop so we can safely cast it as Token
  const safeTypeToken = token as Token;
  return { ticker: safeTypeToken.ticker, protocol: safeTypeToken.protocol };
};

export const mapFtToSwapToken = (st: FungibleToken): Token => {
  if (st.principal === 'BTC') {
    return {
      ticker: 'BTC',
      name: 'Bitcoin',
      protocol: 'btc',
      divisibility: 8,
    };
  }
  if (st.principal === 'STX') {
    return {
      ticker: 'STX',
      name: 'Stacks',
      protocol: 'stx',
      divisibility: 6,
    };
  }

  return {
    ticker: st.principal ?? '',
    name: st.name ?? st.assetName ?? '',
    protocol: mapFTProtocolToSwapProtocol(st),
    divisibility: st.decimals ?? 0,
    logo: st.image ?? st.runeInscriptionId ?? '',
    symbol: st.runeSymbol ?? '',
  };
};
