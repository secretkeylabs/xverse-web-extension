import AccountHeaderComponent from '@components/accountHeader';
import BigNumber from 'bignumber.js';
import BottomBar from '@components/tabBar';
import styled from 'styled-components';
import useDebounce from '@hooks/useDebounce';
import useWalletSelector from '@hooks/useWalletSelector';
import { BRC20ErrorCode } from '@secretkeylabs/xverse-core/transactions/brc20';
import { useBrc20TransferFees } from '@secretkeylabs/xverse-core';
import {
  getFeeValuesForBrc20OneStepTransfer,
  ConfirmBrc20TransferState,
  ExecuteBrc20TransferState,
} from '@utils/brc20';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import { useTranslation } from 'react-i18next';
import ConfirmBrc20TransactionComponent from './confirmBrc20TransactionComponent';
import type { OnChangeFeeRate } from './editFees';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

export function ConfirmBrc20Transaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_BRC_20' });
  const { selectedAccount } = useWalletSelector();
  const navigate = useNavigate();
  const {
    recipientAddress,
    estimateFeesParams,
    estimatedFees: initEstimatedFees,
    token,
  }: ConfirmBrc20TransferState = useLocation().state;

  useResetUserFlow('/confirm-brc20-tx');

  const [userInputFeeRate, setUserInputFeeRate] = useState('');
  const [error, setError] = useState<BRC20ErrorCode | ''>('');
  const debouncedUserInputFeeRate = useDebounce(userInputFeeRate, 300);

  const {
    commitValueBreakdown,
    isLoading: isFeeLoading,
    errorCode,
  } = useBrc20TransferFees({
    ...estimateFeesParams,
    feeRate: Number(debouncedUserInputFeeRate),
    skipInitialFetch: true,
  });

  const { txFee, inscriptionFee, totalFee, btcFee } = getFeeValuesForBrc20OneStepTransfer(
    commitValueBreakdown ?? initEstimatedFees.valueBreakdown,
  );

  /* callbacks */
  const handleClickConfirm = () => {
    if (isLedgerAccount(selectedAccount)) {
      // TODO ledger
    }
    // validate brc20 balance again here
    if (estimateFeesParams.amount > Number(token.balance)) {
      setError(t('ERRORS.INSUFFICIENT_BALANCE'));
      return;
    }
    const state: ExecuteBrc20TransferState = {
      recipientAddress,
      estimateFeesParams,
      token,
    };
    navigate('/execute-brc20-tx', { state });
  };

  const handleClickCancel = () => {
    navigate(-1);
  };

  const handleClickApplyFee: OnChangeFeeRate = (feeRate) => {
    if (feeRate) {
      setUserInputFeeRate(feeRate);
    }
  };

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <ScrollContainer>
        <ConfirmBrc20TransactionComponent
          btcFee={btcFee}
          currentFeeRate={Number(userInputFeeRate) || estimateFeesParams.feeRate}
          inscriptionFee={inscriptionFee}
          onClickApplyFee={handleClickApplyFee}
          onChangeFee={handleClickApplyFee}
          onClickCancel={handleClickCancel}
          onClickConfirm={handleClickConfirm}
          recipients={[
            { address: recipientAddress, amountSats: new BigNumber(estimateFeesParams.amount) },
          ]}
          token={token}
          totalFee={totalFee}
          transactionFee={txFee}
          isFeeLoading={isFeeLoading}
          error={error || errorCode || ''}
        />
        {!isInOptions() && <BottomBar tab="dashboard" />}
      </ScrollContainer>
    </>
  );
}
export default ConfirmBrc20Transaction;
