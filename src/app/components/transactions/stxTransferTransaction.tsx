import ActionButton from '@components/button';
import TransactionAmount from '@components/transactions/transactionAmount';
import TransactionRecipient from '@components/transactions/transactionRecipient';
import TransactionStatusIcon from '@components/transactions/transactionStatusIcon';
import TransactionTitle from '@components/transactions/transactionTitle';
import useWalletSelector from '@hooks/useWalletSelector';
import { FastForward } from '@phosphor-icons/react';
import { StxTransactionData } from '@secretkeylabs/xverse-core';
import { CurrencyTypes } from '@utils/constants';
import { getStxTxStatusUrl } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

const TransactionContainer = styled.button((props) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
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

const TransactionInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: props.theme.space.s,
  flex: 1,
}));

const TransactionAmountContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  flex: 1,
});

const TransactionRow = styled.div((props) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  ...props.theme.body_bold_m,
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

interface StxTransferTransactionProps {
  transaction: StxTransactionData;
  transactionCoin: CurrencyTypes;
}

export default function StxTransferTransaction({
  transaction,
  transactionCoin,
}: StxTransferTransactionProps) {
  const { network, hasActivatedRBFKey } = useWalletSelector();
  const theme = useTheme();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const showAccelerateButton =
    hasActivatedRBFKey && transaction.txStatus === 'pending' && !transaction.incoming;

  const openTxStatusUrl = () => {
    window.open(getStxTxStatusUrl(transaction.txid, network), '_blank', 'noopener,noreferrer');
  };
  return (
    <TransactionContainer onClick={openTxStatusUrl}>
      <TransactionStatusIcon transaction={transaction} currency="STX" />
      <TransactionInfoContainer>
        <TransactionRow>
          <div>
            <TransactionTitle transaction={transaction} />
            <TransactionRecipient transaction={transaction} />
          </div>
          <TransactionAmountContainer>
            <TransactionAmount transaction={transaction} coin={transactionCoin} />
            {showAccelerateButton && (
              <StyledButton
                transparent
                text={t('SPEED_UP')}
                onPress={(e) => {
                  e.stopPropagation();

                  navigate(`/speed-up-tx/${transaction.txid}`, {
                    state: {
                      transaction,
                    },
                  });
                }}
                icon={<FastForward size={16} color={theme.colors.tangerine} weight="fill" />}
                iconPosition="right"
              />
            )}
          </TransactionAmountContainer>
        </TransactionRow>
      </TransactionInfoContainer>
    </TransactionContainer>
  );
}
