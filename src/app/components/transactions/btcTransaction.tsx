import { BtcTransactionData } from '@secretkeylabs/xverse-core';
import styled from 'styled-components';
import TransactionAmount from './transactionAmount';
import TransactionRecipient from './transactionRecipient';
import TransactionStatusIcon from './transactionStatusIcon';
import TransactionTitle from './transactionTitle';

interface TransactionHistoryItemProps {
  transaction: BtcTransactionData;
}

const TransactionContainer = styled.div((props) => ({
  display: 'flex',
  marginBottom: props.theme.spacing(10),
}));

const TransactionInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(6),
  flex: 1,
}));

const TransactionRow = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  ...props.theme.body_bold_m,
}));

export default function BtcTransactionHistoryItem(props: TransactionHistoryItemProps) {
  const { transaction } = props;

  return (
    <TransactionContainer>
      <TransactionStatusIcon transaction={transaction} currency="BTC" />
      <TransactionInfoContainer>
        <TransactionRow>
          <TransactionTitle transaction={transaction} />
          <TransactionAmount transaction={transaction} coin="BTC" />
        </TransactionRow>
        <TransactionRow>
          <TransactionRecipient transaction={transaction} />
        </TransactionRow>
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}
