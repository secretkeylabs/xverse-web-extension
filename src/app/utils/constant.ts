export type Network = 'Mainnet' | 'Testnet';
export type CurrencyTypes = 'STX' | 'BTC' | 'FT' | 'NFT';
export enum LoaderSize {
    SMALLEST,
    SMALL,
    MEDIUM,
    LARGE,
}

export const BITCOIN_DUST_AMOUNT_SATS = 5500;