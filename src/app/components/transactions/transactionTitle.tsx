import { useVisibleSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import type {
  Brc20HistoryTransactionData,
  BtcTransactionData,
  GetRunesActivityForAddressEvent,
  StxTransactionData,
  TransactionData,
} from '@secretkeylabs/xverse-core';
import { SEND_MANY_TOKEN_TRANSFER_CONTRACT_PRINCIPAL } from '@utils/constants';
import { isRuneTransaction } from '@utils/transactions/transactions';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface TransactionTitleProps {
  transaction:
    | StxTransactionData
    | BtcTransactionData
    | Brc20HistoryTransactionData
    | GetRunesActivityForAddressEvent;
}

const TransactionTitleText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_0,
  textAlign: 'left',
}));

export default function TransactionTitle(props: TransactionTitleProps) {
  const { transaction } = props;
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const { visible: sip10CoinsList } = useVisibleSip10FungibleTokens();

  const getTokenTransferTitle = (
    tx: StxTransactionData | BtcTransactionData | Brc20HistoryTransactionData,
  ): string => {
    if (tx.txStatus === 'pending') {
      return tx.incoming ? t('TRANSACTION_PENDING_RECEIVING') : t('TRANSACTION_PENDING_SENDING');
    }
    return tx.incoming ? t('TRANSACTION_RECEIVED') : t('TRANSACTION_SENT');
  };

  const getBrc20TokenTitle = (tx: Brc20HistoryTransactionData): string => {
    if (tx.txStatus === 'pending') {
      return tx.incoming ? t('TRANSACTION_PENDING_RECEIVING') : t('TRANSACTION_PENDING_SENDING');
    }
    if (tx.operation === 'transfer_send') {
      return tx.incoming ? t('TRANSACTION_RECEIVED') : t('TRANSACTION_SENT');
    }
    if (tx.operation === 'mint') {
      return t('MINT');
    }
    if (tx.operation === 'transfer') {
      return t('INSCRIBE_TRANSFER');
    }
    return tx.operation;
  };

  const getRuneTokenTitle = (tx: GetRunesActivityForAddressEvent): string => {
    if (tx.burned) {
      return t('BURNED');
    }
    if (tx.amount === '0') {
      return t('TRANSACTION_RUNE_RESTRUCTURED');
    }
    if (BigNumber(tx.amount).gt(0)) {
      return t('TRANSACTION_RECEIVED');
    }
    if (BigNumber(tx.amount).lt(0)) {
      return t('TRANSACTION_SENT');
    }
    return t('TRANSACTION_STATUS_UNKNOWN');
  };

  const getBtcTokenTransferTitle = (tx: BtcTransactionData): string => {
    if (tx.txStatus === 'pending') {
      if (tx.isOrdinal) {
        return tx.incoming
          ? t('ORDINAL_TRANSACTION_PENDING_RECEIVING')
          : t('ORDINAL_TRANSACTION_PENDING_SENDING');
      }
      return tx.incoming ? t('TRANSACTION_PENDING_RECEIVING') : t('TRANSACTION_PENDING_SENDING');
    }
    return tx.incoming ? t('TRANSACTION_RECEIVED') : t('TRANSACTION_SENT');
  };

  const getFtName = (tx: TransactionData): string => {
    const coinDisplayName = sip10CoinsList.find(
      (coin) => coin.principal === tx.contractCall?.contract_id,
    )?.name;

    return coinDisplayName ?? '';
  };

  const getContractCallTitle = (tx: TransactionData): string => {
    if (tx.contractCall?.contract_id === SEND_MANY_TOKEN_TRANSFER_CONTRACT_PRINCIPAL) {
      return t('TRANSACTION_CONTRACT_TOKEN_TRANSFER');
    }
    const name = tx?.contractCall?.contract_id.split('.') || [];
    switch (tx.contractCall?.function_name) {
      case 'delegate-stx':
        return t('TRANSACTION_STACKING_DELEGATION');
      case 'revoke-delegate-stx':
        return t('TRANSACTION_STACKING_REVOKE_DELEGATION');
      case 'allow-contract-caller':
        return t('TRANSACTION_STACKING_CONTRACT_AUTHORIZE');
      case 'transfer':
        if (tx.tokenType === 'fungible') {
          return `${getFtName(tx)} ${t('TRANSACTION_FUNGIBLE_TOKEN_TRANSFER')}`;
        }
        return `${name[1]} - ${tx.contractCall?.function_name}`;

      default:
        return `${tx.contractCall?.function_name}`;
    }
  };

  const getTransactionTitle = (
    tx:
      | StxTransactionData
      | BtcTransactionData
      | Brc20HistoryTransactionData
      | GetRunesActivityForAddressEvent,
  ): string => {
    if (isRuneTransaction(tx)) {
      return getRuneTokenTitle(tx);
    }
    switch (tx.txType) {
      case 'token_transfer':
        return getTokenTransferTitle(
          transaction as StxTransactionData | BtcTransactionData | Brc20HistoryTransactionData,
        );
      case 'coinbase':
        return t('TRANSACTION_COINBASE');
      case 'contract_call':
        return getContractCallTitle(tx);
      case 'smart_contract':
        return t('TRANSACTION_CONTRACT_DEPLOY');
      case 'poison_microblock':
        return t('TRANSACTION_POISON_MICRO_BLOCK');
      case 'bitcoin':
        return getBtcTokenTransferTitle(transaction as BtcTransactionData);
      case 'brc20':
        return getBrc20TokenTitle(transaction as Brc20HistoryTransactionData);
      default:
        return t('TRANSACTION_STATUS_UNKNOWN');
    }
  };
  return <TransactionTitleText>{getTransactionTitle(transaction)}</TransactionTitleText>;
}
