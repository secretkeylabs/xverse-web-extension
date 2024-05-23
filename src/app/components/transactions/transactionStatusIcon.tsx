import BurnIcon from '@assets/img/transactions/burned.svg';
import ContractIcon from '@assets/img/transactions/contract.svg';
import FailedIcon from '@assets/img/transactions/failed.svg';
import OrdinalsIcon from '@assets/img/transactions/ordinal.svg';
import PendingIcon from '@assets/img/transactions/pending.svg';
import ReceiveIcon from '@assets/img/transactions/received.svg';
import SendIcon from '@assets/img/transactions/sent.svg';

import {
  Brc20HistoryTransactionData,
  BtcTransactionData,
  FungibleTokenProtocol,
  GetRunesActivityForAddressEvent,
  StxTransactionData,
} from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import BigNumber from 'bignumber.js';

interface TransactionStatusIconPros {
  transaction:
    | StxTransactionData
    | BtcTransactionData
    | Brc20HistoryTransactionData
    | GetRunesActivityForAddressEvent;
  currency: CurrencyTypes;
  protocol?: FungibleTokenProtocol;
}

function TransactionStatusIcon(props: TransactionStatusIconPros) {
  const { currency, transaction, protocol } = props;
  if (currency === 'STX' || (currency === 'FT' && protocol === 'stacks')) {
    const tx = transaction as StxTransactionData;
    if (tx.txStatus === 'abort_by_response' || tx.txStatus === 'abort_by_post_condition') {
      return <img src={FailedIcon} alt="pending" />;
    }
    if (tx.txType === 'token_transfer' || tx.tokenType === 'fungible') {
      if (tx.txStatus === 'pending') {
        return <img src={PendingIcon} alt="pending" />;
      }
      if (tx.incoming) {
        return <img width={24} height={24} src={ReceiveIcon} alt="received" />;
      }
      return <img width={24} height={24} src={SendIcon} alt="sent" />;
    }
    if (tx.txStatus === 'pending') {
      return <img src={PendingIcon} alt="pending" />;
    }
    return <img src={ContractIcon} alt="contract-call" />;
  }
  if (currency === 'BTC') {
    const tx = transaction as BtcTransactionData;
    if (tx.txStatus === 'pending') {
      return <img src={PendingIcon} alt="pending" />;
    }
    if (tx.isOrdinal) {
      return <img src={OrdinalsIcon} alt="ordinals-transfer" />;
    }
    if (tx.incoming) {
      return <img width={24} height={24} src={ReceiveIcon} alt="received" />;
    }
    return <img width={24} height={24} src={SendIcon} alt="sent" />;
  }
  if (currency === 'FT' && protocol === 'brc-20') {
    const tx = transaction as Brc20HistoryTransactionData;
    if (tx.txStatus === 'pending') {
      return <img src={PendingIcon} alt="pending" />;
    }
    if (tx.incoming) {
      return <img width={24} height={24} src={ReceiveIcon} alt="received" />;
    }
    if (tx.operation === 'transfer_send' && !tx.incoming) {
      return <img width={24} height={24} src={SendIcon} alt="sent" />;
    }
    return <img src={ContractIcon} alt="inscribe-transaction" />;
  }
  if (currency === 'FT' && protocol === 'runes') {
    const tx = transaction as GetRunesActivityForAddressEvent;
    if (tx.burned) {
      return <img width={24} height={24} src={BurnIcon} alt="burned" />;
    }
    if (BigNumber(tx.amount).lt(0)) {
      return <img width={24} height={24} src={SendIcon} alt="sent" />;
    }
    if (BigNumber(tx.amount).gt(0)) {
      return <img width={24} height={24} src={ReceiveIcon} alt="received" />;
    }
  }
  return <img src={ContractIcon} alt="contract" />;
}
export default TransactionStatusIcon;
