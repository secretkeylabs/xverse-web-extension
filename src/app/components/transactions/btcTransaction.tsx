import useWalletSelector from '@hooks/useWalletSelector';
import { Brc20HistoryTransactionData, BtcTransactionData } from '@secretkeylabs/xverse-core';
import { getBtcTxStatusUrl } from '@utils/helper';
import { isBtcTransaction } from '@utils/transactions/transactions';
import { useCallback } from 'react';
import styled from 'styled-components';
import TransactionAmount from './transactionAmount';
import TransactionRecipient from './transactionRecipient';
import TransactionStatusIcon from './transactionStatusIcon';
import TransactionTitle from './transactionTitle';

interface TransactionHistoryItemProps {
  transaction: BtcTransactionData | Brc20HistoryTransactionData;
}

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

const TransactionAmountContainer = styled.div({
  display: 'flex',
  flex: 1,
  width: '100%',
  justifyContent: 'flex-end',
});

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
  const { network } = useWalletSelector();
  const isBtc = isBtcTransaction(transaction) ? 'BTC' : 'brc20';
  const openBtcTxStatusLink = useCallback(() => {
    window.open(getBtcTxStatusUrl(transaction.txid, network), '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <TransactionContainer onClick={openBtcTxStatusLink}>
      <TransactionStatusIcon transaction={transaction} currency={isBtc} />
      <TransactionInfoContainer>
        <TransactionRow>
          <TransactionTitle transaction={transaction} />
          <TransactionAmountContainer>
            <TransactionAmount transaction={transaction} coin={isBtc} />
          </TransactionAmountContainer>
        </TransactionRow>
        <TransactionRow>
          <TransactionRecipient transaction={transaction} />
        </TransactionRow>
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}
