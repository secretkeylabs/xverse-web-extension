import { LoadingTransactionStatus } from '@components/loadingTransactionStatus';
import { ConfirmationStatus } from '@components/loadingTransactionStatus/circularSvgAnimation';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import { ExecuteTransferProgressCodes, useBrc20TransferExecute } from '@secretkeylabs/xverse-core';
import { ExecuteBrc20TransferState } from '@utils/brc20';
import { getBtcTxStatusUrl } from '@utils/helper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const AMOUNT_OF_STEPS = Object.keys(ExecuteTransferProgressCodes).length + 1;
const PERCENTAGE_PER_STEP = 1 / AMOUNT_OF_STEPS;

export function ExecuteBrc20Transaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'EXECUTE_BRC20' });
  const { selectedAccount, btcAddress, network } = useWalletSelector();
  const navigate = useNavigate();
  const { recipientAddress, estimateFeesParams }: ExecuteBrc20TransferState = useLocation().state;
  const { getSeed } = useSeedVault();

  const { progress, complete, executeTransfer, transferTransactionId, errorCode } =
    useBrc20TransferExecute({
      ...estimateFeesParams,
      getSeedPhrase: getSeed,
      accountIndex: selectedAccount?.id ?? 0,
      changeAddress: btcAddress,
      recipientAddress,
      network: network.type,
    });

  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    executeTransfer();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  /* callbacks */
  const handleClickClose = () => {
    navigate('/');
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
      title: t('TRANSACTION_HEADLINE', { status: 'Broadcasted' }),
      description: t('YOUR_TRANSACTION_HAS_BEEN'),
    },
    FAILURE: {
      title: t('TRANSACTION_HEADLINE', { status: 'Failed' }),
      description: (
        <>
          {t('XVERSE_WALLET_ROUTER')}
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
        title: t('BROADCASTING_YOUR'),
        description: t('DO_NOT_CLOSE'),
      }}
      primaryAction={{ onPress: handleClickClose, text: t('CLOSE') }}
      secondaryAction={{
        onPress: handleClickSeeTransaction,
        text: t('SEE_YOUR_TRANSACTION'),
      }}
      loadingPercentage={loadingPercentageAwareOfStatus}
    />
  );
}
export default ExecuteBrc20Transaction;
