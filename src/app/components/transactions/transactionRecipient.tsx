import type {
  Brc20HistoryTransactionData,
  BtcTransactionData,
  GetRunesActivityForAddressEvent,
  StxTransactionData,
} from '@secretkeylabs/xverse-core';
import { getTruncatedAddress } from '@utils/helper';
import {
  isBrc20Transaction,
  isBtcTransaction,
  isRuneTransaction,
} from '@utils/transactions/transactions';
import styled from 'styled-components';

const RecipientAddress = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_400,
  textAlign: 'left',
}));

interface TransactionRecipientProps {
  transaction:
    | StxTransactionData
    | BtcTransactionData
    | Brc20HistoryTransactionData
    | GetRunesActivityForAddressEvent;
}

export default function TransactionRecipient(props: TransactionRecipientProps): JSX.Element | null {
  const { transaction } = props;
  if (isBtcTransaction(transaction)) {
    return (
      <RecipientAddress>
        {getTruncatedAddress(transaction.recipientAddress ?? '', 6)}
      </RecipientAddress>
    );
  }
  if (isBrc20Transaction(transaction)) {
    return (
      <RecipientAddress>
        {getTruncatedAddress(transaction.transfer_send?.to_address ?? '', 6)}
      </RecipientAddress>
    );
  }
  if (!isRuneTransaction(transaction)) {
    if (transaction.txType === 'token_transfer' || transaction.txType === 'coinbase') {
      return (
        <RecipientAddress>
          {getTruncatedAddress(transaction.tokenTransfer?.recipientAddress as string, 6)}
        </RecipientAddress>
      );
    }
  }
  return null;
}
