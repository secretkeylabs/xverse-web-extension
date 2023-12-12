import ActionButton from '@components/button';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';
import TransactionSummary from './transactionSummary';

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: props.theme.spacing(20),
  marginTop: props.theme.spacing(12),
  marginLeft: 16,
  marginRight: 16,
}));

const ConfirmButtonContainer = styled.div((props) => ({
  width: '100%',
  marginLeft: props.theme.spacing(3),
}));

type Props = {
  inputs: btcTransaction.EnhancedInput[];
  outputs: btcTransaction.EnhancedOutput[];
  feeOutput?: btcTransaction.TransactionFeeOutput;
  isLoading: boolean;
  isSubmitting: boolean;
  isError?: boolean;
  showAccountHeader?: boolean;
  hideBottomBar?: boolean;
  cancelText: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  onBackClick?: () => void;
  confirmDisabled?: boolean;
  getFeeForFeeRate?: (feeRate: number, useEffectiveFeeRate?: boolean) => Promise<number>;
  onFeeRateSet?: (feeRate: number) => void;
};

function ConfirmBtcTransaction({
  inputs,
  outputs,
  feeOutput,
  isLoading,
  isSubmitting,
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
}: Props) {
  const hideBackButton = !onBackClick;

  let body = <MoonLoader color="white" size={50} />;

  if (!isLoading) {
    // TODO: this is a bit naive, but should be correct. We may want to look at the sig hash types of the inputs instead
    const isPartialTransaction = !feeOutput;

    body = (
      <TransactionSummary
        inputs={inputs}
        outputs={outputs}
        feeOutput={feeOutput}
        isPartialTransaction={isPartialTransaction}
        getFeeForFeeRate={getFeeForFeeRate}
        onFeeRateSet={onFeeRateSet}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <SendLayout
      selectedBottomTab="dashboard"
      onClickBack={onBackClick}
      hideBackButton={hideBackButton}
      showAccountHeader={showAccountHeader}
      hideBottomBar={hideBottomBar}
    >
      {body}
      {!isLoading && (
        <ButtonsContainer>
          <ActionButton onPress={onCancel} text={cancelText} transparent />
          <ConfirmButtonContainer>
            <ActionButton
              onPress={onConfirm}
              disabled={confirmDisabled}
              processing={isSubmitting}
              text={confirmText}
              warning={isError}
            />
          </ConfirmButtonContainer>
        </ButtonsContainer>
      )}
    </SendLayout>
  );
}

export default ConfirmBtcTransaction;
