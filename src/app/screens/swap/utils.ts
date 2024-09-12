import type {
  FungibleToken,
  FungibleTokenProtocol,
  Protocol,
  Token,
  TokenBasic,
} from '@secretkeylabs/xverse-core';
import type { CurrencyTypes } from '@utils/constants';
import { btcFt, stxFt } from './useMasterCoinsList';

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

export const mapSwapProtocolToFTProtocol = (protocol: Protocol): FungibleTokenProtocol => {
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
  if (st.principal === 'BTC' && st !== btcFt) {
    return mapFtToSwapToken(btcFt);
  }
  if (st.principal === 'STX' && st !== stxFt) {
    return mapFtToSwapToken(stxFt);
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

export const isRunesTx = ({
  fromToken,
  toToken,
}: {
  fromToken: FungibleToken;
  toToken: Token;
}): boolean =>
  (fromToken?.protocol === 'runes' || toToken?.protocol === 'runes') &&
  (fromToken?.principal === 'BTC' || toToken?.ticker === 'BTC');

export const isStxTx = ({
  fromToken,
  toToken,
}: {
  fromToken?: FungibleToken;
  toToken?: Token;
}): boolean =>
  fromToken?.protocol === 'stacks' ||
  fromToken?.principal === 'STX' ||
  toToken?.protocol === 'sip10' ||
  toToken?.ticker === 'STX';

const getIdentifier = (token?: Token | FungibleToken) => {
  if (!token) return '';
  return 'principal' in token ? token.principal : token.ticker;
};

export const isMotherToken = (token?: Token | FungibleToken) => {
  const identifier = getIdentifier(token);
  return identifier === 'BTC' || identifier === 'STX';
};

export const getTrackingIdentifier = (token?: Token | FungibleToken) => {
  const identifier = getIdentifier(token);
  return isMotherToken(token) ? identifier : token?.name ?? identifier;
};
