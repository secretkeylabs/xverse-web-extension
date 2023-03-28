import styled from 'styled-components';
import { StxTransactionData } from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import TransactionStatusIcon from '@components/transactions/transactionStatusIcon';
import TransactionTitle from '@components/transactions/transactionTitle';
import TransactionAmount from '@components/transactions/transactionAmount';
import TransactionRecipient from '@components/transactions/transactionRecipient';
import { getStxTxStatusUrl } from '@utils/helper';
import useWalletSelector from '@hooks/useWalletSelector';

const TransactionContainer = styled.button((props) => ({
  display: 'flex',
  width: '100%',
  paddingTop: props.theme.spacing(5),
  paddingBottom: props.theme.spacing(5),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  background: 'none',
  ':hover': {
    background: props.theme.colors.white[900],
  },
  ':focus': {
    background: props.theme.colors.white[850],
  },
}));

const TransactionInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.spacing(6),
  flex: 1,
}));

const TransactionAmountContainer = styled.div({
  display: 'flex',
  flex: 1,
  width: '100%',
  justifyContent: 'flex-end',
});

const TransactionRow = styled.div((props) => ({
  display: 'flex',
  width: '100%',
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
  const {
    network,
  } = useWalletSelector();

  const openTxStatusUrl = () => {
    window.open(getStxTxStatusUrl(transaction.txid, network), '_blank', 'noopener,noreferrer');
  };
  return (
    <TransactionContainer onClick={openTxStatusUrl}>
      <TransactionStatusIcon transaction={transaction} currency="STX" />
      <TransactionInfoContainer>
        <TransactionRow>
          <TransactionTitle transaction={transaction} />
          <TransactionAmountContainer>
            <TransactionAmount transaction={transaction} coin={transactionCoin} />
          </TransactionAmountContainer>

        </TransactionRow>
        <TransactionRecipient transaction={transaction} />
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}
