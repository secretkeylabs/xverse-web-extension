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
import { getFtTicker } from '@utils/tokens';
import { ftDecimals } from '@utils/helper';

const TransactionContainer = styled.div((props) => ({
  display: 'flex',
  paddingTop: props.theme.spacing(5),
  paddingBottom: props.theme.spacing(5),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
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
  txFilter: string | null;
}

export default function TxTransfers(props: TxTransfersProps) {
  const { transaction, coin, txFilter } = props;
  const { selectedAccount, coinsList } = useWalletSelector();
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

  const getTokenTransferTitle = (transfer): string =>
    selectedAccount?.stxAddress === transfer.recipient
      ? t('TRANSACTION_RECEIVED')
      : t('TRANSACTION_SENT');

  function renderTransaction(transactionList) {
    return transactionList.map((transfer) => {
      const isFT = coin === 'FT';
      const ft = coinsList?.find((ftCoin) => ftCoin.principal === txFilter!.split('::')[0]);
      const isSentTransaction = selectedAccount?.stxAddress !== transfer.recipient;
      if (isFT && transfer.asset_identifier !== txFilter) {
        return null;
      }

      return (
        <TransactionContainer key={nanoid()}>
          {renderTransactionIcon(transfer)}
          <TransactionInfoContainer>
            <TransactionRow>
              <TransactionTitleText>{getTokenTransferTitle(transfer)}</TransactionTitleText>
              <NumericFormat
                value={
                  isFT
                    ? ftDecimals(BigNumber(transfer.amount), ft?.decimals ?? 0)
                    : microstacksToStx(BigNumber(transfer.amount)).toString()
                }
                displayType="text"
                thousandSeparator
                prefix={isSentTransaction ? '-' : ''}
                renderText={(value: string) => (
                  <TransactionValue>
                    {`${value} ${isFT && ft ? getFtTicker(ft) : coin}`}
                  </TransactionValue>
                )}
              />
            </TransactionRow>
            <RecipientAddress>{formatAddress(transfer.recipient as string)}</RecipientAddress>
          </TransactionInfoContainer>
        </TransactionContainer>
      );
    });
  }
  return coin === 'FT' && transaction.ft_transfers
    ? renderTransaction(transaction.ft_transfers)
    : renderTransaction(transaction.stx_transfers);
}
