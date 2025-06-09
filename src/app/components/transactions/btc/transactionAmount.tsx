import useWalletSelector from '@hooks/useWalletSelector';
import { satsToBtc, type EnhancedTx } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { ftDecimals } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useTranslation, type TFunction } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { TransactionValue } from '../TransactionValue';

const getInscriptionsMainAssets = (tx: EnhancedTx, t: TFunction) => {
  if (tx.assetInTx !== 'inscriptions') {
    return <StyledP typography="body_medium_m" />;
  }

  if (tx.txType === 'trade') {
    return <TransactionValue amount={t('MULTIPLE_INSCRIPTION_TRANSFERS')} hidePrefix />;
  }

  if (tx.inscriptions.items.length > 1) {
    const isItGoing = tx.txType === 'burn' || tx.txType === 'send';
    return (
      <TransactionValue
        amount={`${isItGoing ? '-' : ''}${t('INSCRIPTION', {
          count: tx.inscriptions.items.length,
        })}`}
      />
    );
  }

  if (tx.txType === 'inscribe') {
    return (
      // v2 will add thumbnail and possible collection data
      <TransactionValue amount={`${t('INSCRIPTION', { count: 1 })}`} />
    );
  }

  if (tx.txType === 'burn') {
    return <TransactionValue amount={`-${t('INSCRIPTION', { count: 1 })}`} />;
  }

  return (
    <TransactionValue
      amount={`${tx.txType === 'send' ? '-' : ''}${t('INSCRIPTION', {
        count: tx.inscriptions.items.length,
      })}`}
    />
  );
};

const getRunesMainAssets = (tx: EnhancedTx, t: TFunction) => {
  if (tx.assetInTx !== 'runes') {
    return <StyledP typography="body_medium_m" />;
  }

  if (tx.txType === 'trade') {
    return <TransactionValue amount={t('MULTIPLE_RUNE_TRANSFERS')} hidePrefix />;
  }

  if (!tx.runes.items.length) {
    return null;
  }

  if (tx.runes.items.length > 1) {
    const isItGoing = tx.txType === 'burn' || tx.txType === 'mintBurn' || tx.txType === 'send';
    return (
      <TransactionValue
        amount={`${isItGoing ? '-' : ''}${t('RUNES', { count: tx.runes.items.length })}`}
      />
    );
  }

  if (tx.txType === 'consolidate' || tx.txType === 'mintBurn') {
    return (
      <NumericFormat
        value={satsToBtc(BigNumber(tx.satsAmount)).toFixed(8)}
        displayType="text"
        thousandSeparator
        renderText={(value: string) => <TransactionValue amount={value} unit="BTC" />}
      />
    );
  }

  const rune = tx.runes.items[0];
  const bigIntRuneAmount = String(BigInt(rune.received) - BigInt(rune.sent));
  const runeAmount = String(ftDecimals(bigIntRuneAmount, Number(rune.divisibility ?? 0)));
  return (
    <NumericFormat
      value={runeAmount}
      displayType="text"
      thousandSeparator
      renderText={(value: string) => <TransactionValue amount={value} unit={rune.symbol} />}
    />
  );
};

const getMultipleAssetsMainAssets = (tx: EnhancedTx, t: TFunction) => {
  if (tx.assetInTx !== 'multipleAssets') {
    return <StyledP typography="body_medium_m" />;
  }

  // if there are more runes or inscriptions we treat it like multiple asset transfers cuz we can't know for sure the tx type
  const areMoreRunesOrInscriptions = tx.runes.hasMore || tx.inscriptions.hasMore;
  if (tx.txType === 'trade' || areMoreRunesOrInscriptions) {
    return <TransactionValue amount={t('MULTIPLE_ASSET_TRANSFERS')} hidePrefix />;
  }

  const isGoing = tx.txType === 'burn' || tx.txType === 'send';
  const assetsCount = tx.runes.items.length + tx.inscriptions.items.length;
  return (
    <TransactionValue amount={`${isGoing ? '-' : ''}${t('ASSETS', { count: assetsCount })}`} />
  );
};

export function TransactionAmount({ tx }: { tx: EnhancedTx }) {
  const { t } = useTranslation('translation', { keyPrefix: 'COIN_DASHBOARD_SCREEN' });
  const { balanceHidden } = useWalletSelector();

  if (balanceHidden) {
    return <TransactionValue hidden />;
  }

  if (tx.assetInTx === 'inscriptions') {
    return getInscriptionsMainAssets(tx, t);
  }

  if (tx.assetInTx === 'runes') {
    return getRunesMainAssets(tx, t);
  }

  if (tx.assetInTx === 'multipleAssets') {
    return getMultipleAssetsMainAssets(tx, t);
  }

  return (
    <NumericFormat
      value={satsToBtc(BigNumber(tx.satsAmount)).toString()}
      displayType="text"
      thousandSeparator
      renderText={(value: string) => <TransactionValue amount={value} unit="BTC" />}
    />
  );
}

export function TransactionAuxiliaryAmount({ tx }: { tx: EnhancedTx }) {
  const { balanceHidden } = useWalletSelector();

  if (balanceHidden) {
    return <TransactionValue hidden />;
  }

  if (tx.assetInTx === 'btc' && tx.txType !== 'consolidate') {
    return (
      <StyledP typography="body_medium_m" color="transparent">
        &nbsp;
      </StyledP>
    );
  }

  if (tx.txType === 'consolidate' || tx.txType === 'mintBurn') {
    return null;
  }

  return (
    <NumericFormat
      value={satsToBtc(BigNumber(tx.satsAmount)).toFixed(8)}
      displayType="text"
      thousandSeparator
      renderText={(value: string) => (
        <TransactionValue amount={value} unit="BTC" customColor="white_400" />
      )}
    />
  );
}
