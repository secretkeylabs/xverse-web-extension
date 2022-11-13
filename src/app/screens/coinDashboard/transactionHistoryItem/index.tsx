import { BtcTransactionData, StxTransactionData } from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import styled from 'styled-components';
import TransactionAmount from './transactionAmount';
import TransactionRecipient from './transactionRecipient';
import TransactionStatusIcon from './transactionStatusIcon';
import TransactionTitle from './transactionTitle';

interface TransactionHistoryItemProps {
  transaction: StxTransactionData | BtcTransactionData;
  transactionCoin: CurrencyTypes;
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

export default function TransactionHistoryItem(props: TransactionHistoryItemProps) {
  const {
    transaction,
    transactionCoin,
  } = props;

  return (
    <>
      <TransactionContainer>
        <TransactionStatusIcon transaction={transaction} currency="STX" />
        <TransactionInfoContainer>
          <TransactionRow>
            <TransactionTitle transaction={transaction} />
            <TransactionAmount transaction={transaction} coin={transactionCoin} />
          </TransactionRow>
          <TransactionRow>
            <TransactionRecipient transaction={transaction} />
          </TransactionRow>
        </TransactionInfoContainer>
      </TransactionContainer>
      <div />
    </>
  );
}
