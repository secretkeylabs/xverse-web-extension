import { BtcTransactionData, StxTransactionData } from '@secretkeylabs/xverse-core';
import styled from 'styled-components';

const RecipientAddress = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_400,
  textAlign: 'left',
}));

interface TransactionRecipientProps {
  transaction: StxTransactionData | BtcTransactionData;
}

function isBtcTransaction(tx: StxTransactionData | BtcTransactionData): tx is BtcTransactionData {
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
  if (transaction.txType === 'token_transfer' || transaction.txType === 'coinbase') {
    return (
      <RecipientAddress>
        {formatAddress(transaction.tokenTransfer?.recipientAddress as string)}
      </RecipientAddress>
    );
  }
  return null;
}
