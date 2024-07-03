import { GetRunesUtxoItem } from '@secretkeylabs/xverse-core';

export const getFullTxId = (item: GetRunesUtxoItem) => `${item.txid}:${item.vout.toString()}`;

export const getVoutFromFullTxId = (id: string) => id.split(':').pop() || '';
export const getTxIdFromFullTxId = (id: string): string => id.split(':')[0] || '';

export type RuneItem = {
  selected: boolean;
  amount: number;
  satAmount: number;
  priceSats: number;
  useIndividualCustomPrice: boolean;
};
