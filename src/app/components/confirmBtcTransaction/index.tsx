import KeystoneSteps from '@components/keystoneSteps';
import LedgerSteps from '@components/ledgerSteps';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  type Brc20Definition,
  type btcTransaction,
  type EtchActionDetails,
  type KeystoneTransport,
  type LedgerTransport,
  type MintActionDetails,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout, { type CalloutProps } from '@ui-library/callout';
import { StickyHorizontalSplitButtonContainer, StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import type { TabType } from '@utils/helper';
import { isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import ConfirmTxLayout from 'app/layouts/confirmTxLayout';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { Color } from '../../../theme';
import useExtractTxSummary from './hooks/useExtractTxSummary';
import { TxSummaryContext } from './hooks/useTxSummaryContext';
import TransactionSummary from './transactionSummary';

const LoaderContainer = styled.div(() => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

const ReviewTransactionText = styled(StyledP)`
  text-align: left;
  margin-bottom: ${(props) => props.theme.space.l};
`;

const SpacedCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.space.m};
`;

type Props = {
  summary?: btcTransaction.TransactionSummary | btcTransaction.PsbtSummary;
  runeMintDetails?: MintActionDetails;
  runeEtchDetails?: EtchActionDetails;
  brc20Summary?: Brc20Definition & { status: string; statusColor: Color };
  isLoading: boolean;
  isSubmitting: boolean;
  isBroadcast?: boolean;
  isError?: boolean;
  showAccountHeader?: boolean;
  hideBottomBar?: boolean;
  cancelText: string;
  confirmText: string;
  onConfirm: (options?: {
    ledgerTransport?: LedgerTransport;
    keystoneTransport?: KeystoneTransport;
  }) => void;
  onCancel: () => void;
  onBackClick?: () => void;
  confirmDisabled?: boolean;
  getFeeForFeeRate?: (
    feeRate: number,
    useEffectiveFeeRate?: boolean,
  ) => Promise<number | undefined>;
  onFeeRateSet?: (feeRate: number) => void;
  feeRate?: number;
  title?: string;
  selectedBottomTab?: TabType;
  customCallout?: CalloutProps;
};

function ConfirmBtcTransaction({
  summary,
  runeMintDetails,
  runeEtchDetails,
  brc20Summary,
  isLoading,
  isSubmitting,
  isBroadcast,
  isError = false,
  cancelText,
  confirmText,
  onConfirm,
  onCancel,
  onBackClick,
  showAccountHeader,
  hideBottomBar,
  confirmDisabled = false,
  getFeeForFeeRate,
  onFeeRateSet,
  feeRate,
  title,
  selectedBottomTab,
  customCallout,
}: Props) {
  const { network } = useWalletSelector();
  const selectedAccount = useSelectedAccount();

  const { data: extractedTxSummary, isLoading: extractTxSummaryLoading } = useExtractTxSummary(
    network.type,
    summary,
  );
  const parsedTxSummaryContextValue = useMemo(
    () => ({ extractedTxSummary, runeMintDetails, runeEtchDetails, brc20Summary }),
    [extractedTxSummary, runeMintDetails, runeEtchDetails, brc20Summary],
  );

  const [isLedgerModalVisible, setIsLedgerModalVisible] = useState(false);
  const [isKeystoneModalVisible, setIsKeystoneModalVisible] = useState(false);

  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const onConfirmPress = async () => {
    if (isLedgerAccount(selectedAccount)) {
      // show ledger connection screens
      setIsLedgerModalVisible(true);
    } else if (isKeystoneAccount(selectedAccount)) {
      // show keystone connection screens
      setIsKeystoneModalVisible(true);
    } else {
      return onConfirm();
    }
  };

  if (isLoading || extractTxSummaryLoading) {
    return (
      <LoaderContainer>
        <Spinner size={50} />
      </LoaderContainer>
    );
  }

  if (extractedTxSummary) {
    const { hasSigHashNone, runes } = extractedTxSummary;
    const { hasInsufficientBalance, hasInvalidMint } = runes;
    return (
      <TxSummaryContext.Provider value={parsedTxSummaryContextValue}>
        <ConfirmTxLayout
          selectedBottomTab={selectedBottomTab ?? 'dashboard'}
          onClickBack={onBackClick}
          hideBackButton={!onBackClick}
          showAccountHeader={showAccountHeader}
          hideBottomBar={hideBottomBar}
        >
          <ReviewTransactionText typography="headline_s">
            {title || t('REVIEW_TRANSACTION')}
          </ReviewTransactionText>
          {/* TODO: add sighash single warning */}
          {hasSigHashNone && (
            <SpacedCallout
              variant="danger"
              titleText={t('PSBT_SIG_HASH_NONE_DISCLAIMER_TITLE')}
              bodyText={t('PSBT_SIG_HASH_NONE_DISCLAIMER')}
            />
          )}
          {hasInsufficientBalance && (
            <SpacedCallout variant="warning" bodyText={t('PSBT_INSUFFICIENT_RUNES')} />
          )}
          {!isBroadcast && <SpacedCallout bodyText={t('PSBT_NO_BROADCAST_DISCLAIMER')} />}
          {customCallout && <Callout {...customCallout} />}
          <TransactionSummary
            feeRate={feeRate}
            getFeeForFeeRate={getFeeForFeeRate}
            onFeeRateSet={onFeeRateSet}
            isSubmitting={isSubmitting}
          />
          {!isLoading && (
            <StickyHorizontalSplitButtonContainer>
              <Button onClick={onCancel} title={cancelText} variant="secondary" />
              <Button
                onClick={onConfirmPress}
                disabled={confirmDisabled || hasInvalidMint}
                loading={isSubmitting}
                title={confirmText}
                variant={isError ? 'danger' : 'primary'}
              />
            </StickyHorizontalSplitButtonContainer>
          )}
        </ConfirmTxLayout>
        <Sheet visible={isLedgerModalVisible} onClose={() => setIsLedgerModalVisible(false)}>
          {isLedgerModalVisible && (
            <LedgerSteps
              onConfirm={onConfirm}
              onCancel={onCancel}
              showExternalInputsWarning={
                extractedTxSummary.hasExternalInputs || !extractedTxSummary.isFinal
              }
            />
          )}
        </Sheet>
        <Sheet visible={isKeystoneModalVisible} onClose={() => setIsKeystoneModalVisible(false)}>
          {isKeystoneModalVisible && <KeystoneSteps onConfirm={onConfirm} onCancel={onCancel} />}
        </Sheet>
      </TxSummaryContext.Provider>
    );
  }
}

export default ConfirmBtcTransaction;
