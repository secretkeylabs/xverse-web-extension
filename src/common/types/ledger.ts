import { UTXO } from '@secretkeylabs/xverse-core';
import { StacksRecipient, Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import BigNumber from 'bignumber.js';

export type LedgerTransactionType = 'BTC' | 'STX' | 'ORDINALS' | 'BRC-20';

export type ConfirmStxTransactionState = {
  unsignedTx: Buffer;
  type: LedgerTransactionType;
  recipients: StacksRecipient[];
  fee: BigNumber;
};

export type ConfirmBtcTransactionState = {
  type: LedgerTransactionType;
  recipients: Recipient[];
  feeRateInput: string;
  fee: BigNumber;
};

export type ConfirmOrdinalsTransactionState = {
  type: LedgerTransactionType;
  recipients: Recipient[];
  feeRateInput: string;
  fee: BigNumber;
  ordinalUtxo: UTXO;
};

export type ConfirmBrc20TransactionState = {
  type: LedgerTransactionType;
  recipients: Recipient[];
  amount: BigNumber;
  fee: BigNumber;
};
