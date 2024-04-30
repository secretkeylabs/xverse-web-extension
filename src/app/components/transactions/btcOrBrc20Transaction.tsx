import ActionButton from '@components/button';
import useWalletSelector from '@hooks/useWalletSelector';
import { FastForward } from '@phosphor-icons/react';
import {
  Brc20HistoryTransactionData,
  BtcTransactionData,
  rbf,
  RBFProps,
} from '@secretkeylabs/xverse-core';
import { getBtcTxStatusUrl } from '@utils/helper';
import { isBtcTransaction } from '@utils/transactions/transactions';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import TransactionAmount from './transactionAmount';
import TransactionRecipient from './transactionRecipient';
import TransactionStatusIcon from './transactionStatusIcon';
import TransactionTitle from './transactionTitle';

const TransactionContainer = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: props.theme.spacing(5),
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
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
  marginLeft: props.theme.space.s,
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
    whiteSpace: 'nowrap',
  },
  ':hover:enabled': {
    backgroundColor: 'transparent',
  },
  ':active:enabled': {
    backgroundColor: 'transparent',
  },
}));

interface TransactionHistoryItemProps {
  transaction: BtcTransactionData | Brc20HistoryTransactionData;
  wallet: RBFProps;
}
export default function BtcOrBrc20TransactionHistoryItem({
  transaction,
  wallet,
}: TransactionHistoryItemProps) {
  const { network, hasActivatedRBFKey } = useWalletSelector();
  const currency = isBtcTransaction(transaction) ? 'BTC' : 'FT';
  const protocol = currency === 'FT' ? 'brc-20' : undefined;
  const theme = useTheme();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });

  const openBtcTxStatusLink = useCallback(() => {
    window.open(getBtcTxStatusUrl(transaction.txid, network), '_blank', 'noopener,noreferrer');
  }, []);

  const showAccelerateButton =
    hasActivatedRBFKey &&
    isBtcTransaction(transaction) &&
    rbf.isTransactionRbfEnabled(transaction, wallet);
  return (
    <TransactionContainer onClick={openBtcTxStatusLink}>
      <TransactionStatusIcon transaction={transaction} currency={currency} protocol={protocol} />
      <TransactionInfoContainer>
        <TransactionRow>
          <div>
            <TransactionTitle transaction={transaction} />
            <TransactionRecipient transaction={transaction} />
          </div>
          <TransactionAmountContainer>
            <TransactionAmount transaction={transaction} currency={currency} protocol={protocol} />
            {showAccelerateButton && (
              <Link to={`/speed-up-tx/${transaction.txid}`}>
                <StyledButton
                  transparent
                  text={t('SPEED_UP')}
                  onPress={(e) => {
                    e.stopPropagation();
                  }}
                  icon={<FastForward size={16} color={theme.colors.tangerine} weight="fill" />}
                  iconPosition="right"
                />
              </Link>
            )}
          </TransactionAmountContainer>
        </TransactionRow>
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}
