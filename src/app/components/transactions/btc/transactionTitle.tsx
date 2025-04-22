import type { EnhancedTx } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const TransactionTitleText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'left',
}));

export function TransactionTitle({ tx }: { tx: EnhancedTx }) {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });

  const getTransactionTitle = () => {
    switch (tx.txType) {
      case 'receive':
        return t('RECEIVE');
      case 'send':
        return t('SEND');
      case 'consolidate':
        if (tx.assetInTx === 'runes') {
          return t('CONSOLIDATE_RUNE', { count: tx.runes.items.length });
        }
        return t('CONSOLIDATE');
      case 'inscribe':
        return t('INSCRIBE');
      case 'burn':
        if (tx.assetInTx === 'inscriptions') {
          return t('BURN_INSCRIPTION', { count: tx.inscriptions.items.length });
        }
        if (tx.assetInTx === 'runes') {
          return t('BURN_RUNE', { count: tx.runes.items.length });
        }
        return t('BURN');
      case 'mint':
        return t('MINT', { count: tx.runes.items.length });
      case 'mintBurn':
        return t('MINT_BURN');
      case 'etch':
        return t('ETCH');
      case 'trade':
        return t('TRADE');
      default:
        return t('TRANSACTION_STATUS_UNKNOWN');
    }
  };

  return <TransactionTitleText>{getTransactionTitle()}</TransactionTitleText>;
}
