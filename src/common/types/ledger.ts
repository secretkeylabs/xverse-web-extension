import { UTXO } from '@secretkeylabs/xverse-core';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import { StacksRecipient } from '@secretkeylabs/xverse-core/transactions/stx';
import BigNumber from 'bignumber.js';

export type LedgerTransactionType = 'BTC' | 'STX' | 'ORDINALS' | 'BRC-20';

type ConfirmLedgerTransactionState = {
  type: LedgerTransactionType;
  fee: BigNumber;
};

export type ConfirmStxTransactionState = ConfirmLedgerTransactionState & {
  recipients: StacksRecipient[];
  unsignedTx: Buffer;
};

export type ConfirmBtcTransactionState = ConfirmLedgerTransactionState & {
  recipients: Recipient[];
  feeRateInput: string;
};

export type ConfirmOrdinalsTransactionState = ConfirmLedgerTransactionState & {
  recipients: Recipient[];
  feeRateInput: string;
  ordinalUtxo: UTXO;
};

export type ConfirmBrc20TransactionState = ConfirmLedgerTransactionState & {
  recipients: Recipient[];
  amount: BigNumber;
};
