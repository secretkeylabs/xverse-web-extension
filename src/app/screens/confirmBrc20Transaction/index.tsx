import AccountHeaderComponent from '@components/accountHeader';
import BigNumber from 'bignumber.js';
import BottomBar from '@components/tabBar';
import styled from 'styled-components';
import useDebounce from '@hooks/useDebounce';
import useWalletSelector from '@hooks/useWalletSelector';
import { BRC20ErrorCode } from '@secretkeylabs/xverse-core/transactions/brc20';
import { brc20TransferEstimateFees, CoreError } from '@secretkeylabs/xverse-core';
import { getFeeValuesForBrc20OneStepTransfer, ConfirmBrc20TransferState } from '@utils/brc20';
import { isLedgerAccount } from '@utils/helper';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import ConfirmBrc20TransactionComponent from './confirmBrc20TransactionComponent';
import { OnChangeFeeRate } from './editFees';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  height: 600px;
  width: 360px;
  margin: auto;
`;

const BottomBarContainer = styled.h1((props) => ({
  marginTop: props.theme.spacing(3),
}));

export function ConfirmBrc20Transaction() {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const { selectedAccount } = useWalletSelector();
  const navigate = useNavigate();
  const {
    recipientAddress,
    estimateFeesParams,
    estimatedFees: initEstimatedFees,
    token,
  }: ConfirmBrc20TransferState = useLocation().state;
  const { subscribeToResetUserFlow } = useResetUserFlow();
  useEffect(() => subscribeToResetUserFlow('/confirm-brc20-tx'), [subscribeToResetUserFlow]);

  const [userInputFeeRate, setUserInputFeeRate] = useState('');
  const [estimatedFees, setEstimatedFees] = useState(initEstimatedFees);
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [error, setError] = useState<BRC20ErrorCode | ''>('');
  const debouncedUserInputFeeRate = useDebounce(userInputFeeRate, 300);

  const { txFee, inscriptionFee, totalFee, btcFee } = getFeeValuesForBrc20OneStepTransfer(
    estimatedFees.valueBreakdown,
  );

  useEffect(() => {
    const runEstimate = async () => {
      setIsFeeLoading(true);
      setError('');
      try {
        const result = await brc20TransferEstimateFees({
          ...estimateFeesParams,
          feeRate: Number(debouncedUserInputFeeRate),
        });
        setEstimatedFees(result);
      } catch (err) {
        const e = err as Error;
        if (CoreError.isCoreError(e) && (e.code ?? '') in BRC20ErrorCode) {
          setError(e.code as BRC20ErrorCode);
          // console.error(e.code);
        } else {
          setError(BRC20ErrorCode.SERVER_ERROR);
        }
      }
      setIsFeeLoading(false);
    };
    if (debouncedUserInputFeeRate) {
      runEstimate();
    }
  }, [debouncedUserInputFeeRate, estimateFeesParams]);

  /* callbacks */
  const handleClickConfirm = () => {
    if (isLedgerAccount(selectedAccount)) {
      // TODO ledger
    }
    // TODO nav to custom tx screen
    // mutate({ signedTx: txHex });
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
          error={error}
        />
        {!isGalleryOpen && (
          <BottomBarContainer>
            <BottomBar tab="nft" />
          </BottomBarContainer>
        )}
      </ScrollContainer>
    </>
  );
}
export default ConfirmBrc20Transaction;
