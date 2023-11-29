import {
  Brc20HistoryTransactionData,
  BtcTransactionData,
  StxTransactionData,
} from '@secretkeylabs/xverse-core';
import { isBrc20Transaction } from '@utils/transactions/transactions';
import styled from 'styled-components';

const RecipientAddress = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_400,
  textAlign: 'left',
}));

interface TransactionRecipientProps {
  transaction: StxTransactionData | BtcTransactionData | Brc20HistoryTransactionData;
}

function isBtcTransaction(
  tx: StxTransactionData | BtcTransactionData | Brc20HistoryTransactionData,
): tx is BtcTransactionData {
  return (tx as BtcTransactionData).txType === 'bitcoin';
}

function formatAddress(addr: string): string {
  return addr ? `${addr.substring(0, 4)}...${addr.substring(addr.length - 4, addr.length)}` : '';
}

export default function TransactionRecipient(props: TransactionRecipientProps): JSX.Element | null {
  const { transaction } = props;
  if (isBtcTransaction(transaction)) {
    return <RecipientAddress>{formatAddress(transaction.recipientAddress ?? '')}</RecipientAddress>;
  }
  if (isBrc20Transaction(transaction)) {
    return (
      <RecipientAddress>
        {formatAddress(transaction.transfer_send?.to_address ?? '')}
      </RecipientAddress>
    );
  }
  if (transaction.txType === 'token_transfer' || transaction.txType === 'coinbase') {
    return (
      <RecipientAddress>
        {formatAddress(transaction.tokenTransfer?.recipientAddress as string)}
      </RecipientAddress>
    );
  }
  return null;
}
