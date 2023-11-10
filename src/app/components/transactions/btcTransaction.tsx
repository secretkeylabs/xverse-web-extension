import ActionButton from '@components/button';
import useWalletSelector from '@hooks/useWalletSelector';
import { Lightning } from '@phosphor-icons/react';
import { Brc20HistoryTransactionData, BtcTransactionData } from '@secretkeylabs/xverse-core';
import { getBtcTxStatusUrl } from '@utils/helper';
import { isBtcTransaction } from '@utils/transactions/transactions';
import { useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
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
    background: props.theme.colors.white_900,
  },
  ':focus': {
    background: props.theme.colors.white_850,
  },
}));

const TransactionAmountContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  flex: 1,
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
  ...props.theme.typography.body_bold_m,
}));

const StyledButton = styled(ActionButton)((props) => ({
  padding: 0,
  border: 'none',
  width: 'auto',
  height: 'auto',
  div: {
    ...props.theme.typography.body_medium_m,
    color: props.theme.colors.tangerine,
  },
  ':hover:enabled': {
    backgroundColor: 'transparent',
  },
  ':active:enabled': {
    backgroundColor: 'transparent',
  },
}));

export default function BtcTransactionHistoryItem(props: TransactionHistoryItemProps) {
  const { transaction } = props;
  const { network } = useWalletSelector();
  const isBtc = isBtcTransaction(transaction) ? 'BTC' : 'brc20';
  const theme = useTheme();

  const openBtcTxStatusLink = useCallback(() => {
    window.open(getBtcTxStatusUrl(transaction.txid, network), '_blank', 'noopener,noreferrer');
  }, []);

  const showAccelerateButton =
    transaction.txStatus === 'pending' &&
    !transaction.incoming &&
    (transaction.txType === 'bitcoin' || transaction.txType === 'brc20');

  return (
    <TransactionContainer onClick={openBtcTxStatusLink}>
      <TransactionStatusIcon transaction={transaction} currency={isBtc} />
      <TransactionInfoContainer>
        <TransactionRow>
          <div>
            <TransactionTitle transaction={transaction} />
            <TransactionRecipient transaction={transaction} />
          </div>
          <TransactionAmountContainer>
            <TransactionAmount transaction={transaction} coin={isBtc} />
            {showAccelerateButton && (
              <StyledButton
                transparent
                text="Accelerate"
                onPress={(e) => {
                  e.stopPropagation();
                }}
                icon={<Lightning size={16} color={theme.colors.tangerine} weight="fill" />}
                iconPosition="right"
              />
            )}
          </TransactionAmountContainer>
        </TransactionRow>
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}
