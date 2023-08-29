import useWalletSelector from '@hooks/useWalletSelector';
import { ExecuteBrc20TransferState } from '@utils/brc20';
import { ExecuteTransferProgressCodes, useBrc20TransferExecute } from '@secretkeylabs/xverse-core';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBtcTxStatusUrl } from '@utils/helper';
import { ConfirmationStatus } from '@components/loadingTransactionStatus/circularSvgAnimation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingTransactionStatus } from '@components/loadingTransactionStatus';

const AMOUNT_OF_STEPS = Object.keys(ExecuteTransferProgressCodes).length + 1;
const PERCENTAGE_PER_STEP = 1 / AMOUNT_OF_STEPS;

export function ExecuteBrc20Transaction() {
  const { t } = useTranslation('translation');
  const { selectedAccount, btcAddress, network, seedPhrase } = useWalletSelector();
  const navigate = useNavigate();
  const { recipientAddress, estimateFeesParams }: ExecuteBrc20TransferState = useLocation().state;

  const { progress, complete, executeTransfer, transferTransactionId, errorCode } =
    useBrc20TransferExecute({
      ...estimateFeesParams,
      seedPhrase,
      accountIndex: selectedAccount?.id ?? 0,
      changeAddress: btcAddress,
      recipientAddress,
      network: network.type,
    });

  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    if (complete || errorCode) {
      return;
    }
    executeTransfer();
  }, [executeTransfer, complete, errorCode]);

  useEffect(() => {
    if (!progress) {
      return;
    }
    setLoadingPercentage((prevProgress) => prevProgress + PERCENTAGE_PER_STEP);
  }, [progress]);

  let confirmationStatus: ConfirmationStatus = 'LOADING';
  if (complete || errorCode) {
    confirmationStatus = complete ? 'SUCCESS' : 'FAILURE';
  }

  // TODO remove debug:
  // useEffect(() => {
  //   if (loadingPercentage >= 1) {
  //     setConfirmationStatus('FAILURE');
  //   } else if (loadingPercentage < 1) {
  //     setConfirmationStatus('LOADING');
  //   }
  //   const timer = setTimeout(() => {
  //     setLoadingPercentage((prevValue) => (prevValue >= 1 ? 0 : prevValue + 0.25));
  //   }, 500);
  //   return () => clearTimeout(timer);
  // }, [loadingPercentage]);

  /* callbacks */
  const handleClickClose = () => {
    navigate(`/dashboard`);
  };

  const handleClickSeeTransaction = () => {
    // TODO tim: navigate to transaction history once brc20 transaction history is done:
    // navigate(`/coinDashboard/brc20?brc20ft=${token?.ticker}`);
    if (transferTransactionId) {
      window.open(
        getBtcTxStatusUrl(transferTransactionId, network),
        '_blank',
        'noopener,noreferrer',
      );
    }
  };

  const resultTexts = {
    SUCCESS: {
      title: t('EXECUTE_BRC20.TRANSACTION_HEADLINE', { status: 'Broadcasted' }),
      description: t('EXECUTE_BRC20.YOUR_TRANSACTION_HAS_BEEN'),
    },
    FAILURE: {
      title: t('EXECUTE_BRC20.TRANSACTION_HEADLINE', { status: 'Failed' }),
      description: (
        <>
          {t('EXECUTE_BRC20.XVERSE_WALLET_ROUTER')}
          <br />
          {errorCode}
        </>
      ),
    },
  }[confirmationStatus];

  const loadingPercentageAwareOfStatus = confirmationStatus !== 'LOADING' ? 1 : loadingPercentage;

  return (
    <LoadingTransactionStatus
      status={confirmationStatus}
      resultTexts={resultTexts}
      loadingTexts={{
        title: t('EXECUTE_BRC20.BROADCASTING_YOUR'),
        description: t('EXECUTE_BRC20.DO_NOT_CLOSE'),
      }}
      primaryAction={{ onPress: handleClickClose, text: t('EXECUTE_BRC20.CLOSE') }}
      secondaryAction={{
        onPress: handleClickSeeTransaction,
        text: t('EXECUTE_BRC20.SEE_YOUR_TRANSACTION'),
      }}
      loadingPercentage={loadingPercentageAwareOfStatus}
    />
  );
}
export default ExecuteBrc20Transaction;
