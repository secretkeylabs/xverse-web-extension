import useWalletSelector from '@hooks/useWalletSelector';
import { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';
import ReceiveIcon from '@assets/img/transactions/received.svg';
import SendIcon from '@assets/img/transactions/sent.svg';
import { CurrencyTypes } from '@utils/constants';
import styled from 'styled-components';
import { nanoid } from 'nanoid';
import { NumericFormat } from 'react-number-format';
import { microstacksToStx } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';

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

const TransactionTitleText = styled.p((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white[0],
}));

const RecipientAddress = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[400],
  textAlign: 'left',
}));

const TransactionValue = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

interface TxTransfersProps {
  transaction: AddressTransactionWithTransfers;
  coin: CurrencyTypes;
}

export default function TxTransfers(props: TxTransfersProps) {
  const { transaction, coin } = props;
  const { selectedAccount } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });

  function formatAddress(addr: string): string {
    return addr ? `${addr.substring(0, 4)}...${addr.substring(addr.length - 4, addr.length)}` : '';
  }

  const renderTransactionIcon = (transfer: any) => {
    if (selectedAccount?.stxAddress === transfer.recipient) {
      return <img src={ReceiveIcon} alt="received" />;
    }
    return <img src={SendIcon} alt="sent" />;
  };

  const getTokenTransferTitle = (transfer): string => (selectedAccount?.stxAddress === transfer.recipient
    ? t('TRANSACTION_RECEIVED')
    : t('TRANSACTION_SENT'));
  return (
    <>
      {transaction.stx_transfers.map((stxTransfer) => (
        <TransactionContainer key={nanoid()}>
          {renderTransactionIcon(stxTransfer)}
          <TransactionInfoContainer>
            <TransactionRow>
              <TransactionTitleText>{getTokenTransferTitle(stxTransfer)}</TransactionTitleText>
              <NumericFormat
                value={microstacksToStx(BigNumber(stxTransfer.amount)).toString()}
                displayType="text"
                thousandSeparator
                prefix={selectedAccount?.stxAddress === stxTransfer.recipient ? '' : '-'}
                renderText={(value: string) => (
                  <TransactionValue>{`${value} ${coin}`}</TransactionValue>
                )}
              />
            </TransactionRow>
            <RecipientAddress>{formatAddress(stxTransfer.recipient as string)}</RecipientAddress>
          </TransactionInfoContainer>
        </TransactionContainer>
      ))}
    </>
  );
}
