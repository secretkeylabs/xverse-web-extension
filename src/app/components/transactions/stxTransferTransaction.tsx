import styled from 'styled-components';
import { StxTransactionData } from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import TransactionStatusIcon from '@components/transactions/transactionStatusIcon';
import TransactionTitle from '@components/transactions/transactionTitle';
import TransactionAmount from '@components/transactions/transactionAmount';
import TransactionRecipient from '@components/transactions/transactionRecipient';

const TransactionContainer = styled.button((props) => ({
  display: 'flex',
  marginBottom: props.theme.spacing(10),
  background: 'none',
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

interface StxTransferTransactionProps {
  transaction: StxTransactionData;
  transactionCoin: CurrencyTypes;
}

export default function StxTransferTransaction(props: StxTransferTransactionProps) {
  const { transaction, transactionCoin } = props;

  const openContractDeployment = () => {
    window.open(`https://explorer.stacks.co/txid/${transaction.txid}?chain=mainnet`, '_blank');
  };
  return (
    <TransactionContainer onClick={openContractDeployment}>
      <TransactionStatusIcon transaction={transaction} currency="STX" />
      <TransactionInfoContainer>
        <TransactionRow>
          <TransactionTitle transaction={transaction} />
          <TransactionAmount transaction={transaction} coin={transactionCoin} />
        </TransactionRow>
        <TransactionRecipient transaction={transaction} />
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}
