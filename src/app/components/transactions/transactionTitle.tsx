import useWalletSelector from '@hooks/useWalletSelector';
import {
  BtcTransactionData,
  StxTransactionData,
  TransactionData,
} from '@secretkeylabs/xverse-core';
import { SEND_MANY_TOKEN_TRANSFER_CONTRACT_PRINCIPAL } from '@utils/constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface TransactionTitleProps {
  transaction: StxTransactionData | BtcTransactionData;
}

const TransactionTitleText = styled.p((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white[0],
}));

export default function TransactionTitle(props: TransactionTitleProps) {
  const { transaction } = props;
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const { coins } = useWalletSelector();

  const getTokenTransferTitle = (tx: TransactionData): string => {
    if (tx.txStatus === 'pending') {
      return tx.incoming ? t('TRANSACTION_PENDING_RECEIVING') : t('TRANSACTION_PENDING_SENDING');
    }
    return tx.incoming ? t('TRANSACTION_RECEIVED') : t('TRANSACTION_SENT');
  };

  const getBtcTokenTransferTitle = (tx: BtcTransactionData): string => {
    if (tx.isOrdinal && tx.txStatus === 'pending') {
      return tx.incoming
        ? t('ORDINAL_TRANSACTION_PENDING_RECEIVING')
        : t('ORDINAL_TRANSACTION_PENDING_SENDING');
    }
    if (tx.txStatus === 'pending') {
      return tx.incoming ? t('TRANSACTION_PENDING_RECEIVING') : t('TRANSACTION_PENDING_SENDING');
    }
    return tx.incoming ? t('TRANSACTION_RECEIVED') : t('TRANSACTION_SENT');
  };

  const getFtName = (tx: TransactionData): string => {
    const coinDisplayName = coins?.find(
      (coin) => coin.contract === tx.contractCall?.contract_id,
    )?.name;

    return coinDisplayName ?? '';
  };

  const getContractCallTitle = (tx: TransactionData): string => {
    if (tx.contractCall?.contract_id === SEND_MANY_TOKEN_TRANSFER_CONTRACT_PRINCIPAL) {
      return t('TRANSACTION_CONTRACT_TOKEN_TRANSFER');
    }
    switch (tx.contractCall?.function_name) {
      case 'delegate-stx':
        return t('TRANSACTION_STACKING_DELEGATION');
      case 'revoke-delegate-stx':
        return t('TRANSACTION_STACKING_REVOKE_DELEGATION');
      case 'allow-contract-caller':
        return t('TRANSACTION_STACKING_CONTRACT_AUTHORIZE');
      case 'transfer':
        const name = tx.contractCall.contract_id.split('.');
        if (tx.tokenType === 'fungible') {
          return `${getFtName(tx)} ${t('TRANSACTION_FUNGIBLE_TOKEN_TRANSFER')}`;
        }
        return `${name[1]} - ${tx.contractCall?.function_name}`;

      default:
        return `${tx.contractCall?.function_name}`;
    }
  };

  const getTransactionTitle = (tx: TransactionData): string => {
    switch (tx.txType) {
      case 'token_transfer':
        return getTokenTransferTitle(transaction);
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
      default:
        return t('TRANSACTION_STATUS_UNKNOWN');
    }
  };
  return <TransactionTitleText>{getTransactionTitle(transaction)}</TransactionTitleText>;
}
