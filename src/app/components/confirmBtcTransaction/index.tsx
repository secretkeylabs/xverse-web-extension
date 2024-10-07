import LedgerSteps from '@components/ledgerSteps';
import type { Tab } from '@components/tabBar';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  type Brc20Definition,
  type btcTransaction,
  type EtchActionDetails,
  type MintActionDetails,
  type Transport,
} from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Callout, { type CalloutProps } from '@ui-library/callout';
import { StickyHorizontalSplitButtonContainer, StyledP } from '@ui-library/common.styled';
import Sheet from '@ui-library/sheet';
import Spinner from '@ui-library/spinner';
import { isLedgerAccount } from '@utils/helper';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { Color } from '../../../theme';
import SendLayout from '../../layouts/sendLayout';
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
  onConfirm: (ledgerTransport?: Transport) => void;
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
  selectedBottomTab?: Tab;
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

  const [isModalVisible, setIsModalVisible] = useState(false);

  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const onConfirmPress = async () => {
    if (!isLedgerAccount(selectedAccount)) {
      return onConfirm();
    }
    // show ledger connection screens
    setIsModalVisible(true);
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
        {/* TODO start a new layout. SendLayout was not intended for the review screens */}
        <SendLayout
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
                disabled={confirmDisabled || hasInsufficientBalance || hasInvalidMint}
                loading={isSubmitting}
                title={hasInsufficientBalance ? t('INSUFFICIENT_BALANCE') : confirmText}
                variant={isError || hasInsufficientBalance ? 'danger' : 'primary'}
              />
            </StickyHorizontalSplitButtonContainer>
          )}
        </SendLayout>
        <Sheet visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
          {isModalVisible && <LedgerSteps onConfirm={onConfirm} onCancel={onCancel} />}
        </Sheet>
      </TxSummaryContext.Provider>
    );
  }
}

export default ConfirmBtcTransaction;
