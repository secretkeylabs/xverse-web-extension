import type { EnhancedTx } from '@secretkeylabs/xverse-core';
import { getTruncatedAddress } from '@utils/helper';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { Color } from 'theme';

const RecipientAddress = styled.p<{ $color?: Color }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors[props.$color ?? 'white_400'],
  textAlign: 'left',
}));

export function TransactionRecipient({
  tx,
  walletAddressesDictionary,
}: {
  tx: EnhancedTx;
  walletAddressesDictionary: Map<string, string>;
}): JSX.Element | null {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });

  const getParsedAddressInTx = () => {
    // for some txs we don't need to display addresses
    if (!tx.addressesInTx) {
      return null;
    }

    if (tx.addressesInTx.hasMore) {
      return t(
        tx.txType === 'trade'
          ? 'MULTIPLE_COUNTERPARTIES'
          : tx.txType === 'receive' || tx.txType === 'inscribe'
          ? 'FROM_MULTIPLE_ADDRESSES'
          : 'TO_MULTIPLE_ADDRESSES',
      );
    }

    // if no external check own addresses
    if (!tx.addressesInTx.external.length) {
      const isAtLeastOnePaymentAddress =
        tx.addressesInTx.isOwnNative || tx.addressesInTx.isOwnNested;
      const isTaprootAddress = tx.addressesInTx.isOwnTaproot;

      return isAtLeastOnePaymentAddress && isTaprootAddress
        ? t('MY_ADDRESSES')
        : tx.addressesInTx.isOwnTaproot
        ? t('TO_MY_ORDINALS_ADDRESS')
        : t('TO_MY_PAYMENT_ADDRESS');
    }

    // if one external check other addresses in the wallet or show truncated address
    if (tx.addressesInTx.external.length === 1) {
      const address = tx.addressesInTx.external[0].address ?? '';
      const accountName = walletAddressesDictionary.get(address);
      return accountName ?? getTruncatedAddress(address, 6);
    }

    // if more than one external just return from/to addresses
    const count = tx.addressesInTx.external.length;

    if (tx.txType === 'trade') {
      return t('COUNTERPARTIES', { count });
    }

    return t(
      tx.txType === 'receive' || tx.txType === 'inscribe' ? 'FROM_ADDRESSES' : 'TO_ADDRESSES',
      { count },
    );
  };

  const isWalletAddress =
    tx.addressesInTx?.external.length === 1 &&
    walletAddressesDictionary.get(tx.addressesInTx?.external[0].address ?? '');

  return (
    <RecipientAddress $color={isWalletAddress ? 'white_0' : 'white_400'}>
      {getParsedAddressInTx()}
    </RecipientAddress>
  );
}
