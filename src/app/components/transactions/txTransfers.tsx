import ReceiveIcon from '@assets/img/transactions/received.svg';
import SendIcon from '@assets/img/transactions/sent.svg';
import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useWalletSelector from '@hooks/useWalletSelector';
import { microstacksToStx } from '@secretkeylabs/xverse-core';
import { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';
import { CurrencyTypes } from '@utils/constants';
import { ftDecimals } from '@utils/helper';
import { getFtTicker } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

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
  ...props.theme.typography.body_bold_m,
}));

const TransactionTitleText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
}));

const RecipientAddress = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_400,
  textAlign: 'left',
}));

const TransactionValue = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

interface TxTransfersProps {
  transaction: AddressTransactionWithTransfers;
  coin: CurrencyTypes;
  txFilter: string | null;
}

export default function TxTransfers(props: TxTransfersProps) {
  const { transaction, coin, txFilter } = props;
  const { selectedAccount } = useWalletSelector();
  const { visible: sip10CoinsList } = useVisibleSip10FungibleTokens();
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });

  function formatAddress(addr: string): string {
    return addr ? `${addr.substring(0, 4)}...${addr.substring(addr.length - 4, addr.length)}` : '';
  }

  const renderTransactionIcon = (transfer: any) => {
    if (selectedAccount?.stxAddress === transfer.recipient) {
      return <img width={24} height={24} src={ReceiveIcon} alt="received" />;
    }
    return <img width={24} height={24} src={SendIcon} alt="sent" />;
  };

  const getTokenTransferTitle = (transfer): string =>
    selectedAccount?.stxAddress === transfer.recipient
      ? t('TRANSACTION_RECEIVED')
      : t('TRANSACTION_SENT');

  function renderTransaction(transactionList) {
    return transactionList.map((transfer) => {
      const isFT = coin === 'FT';
      const ft = sip10CoinsList.find((ftCoin) => ftCoin.principal === txFilter!.split('::')[0]);
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
                allowNegative={false}
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
