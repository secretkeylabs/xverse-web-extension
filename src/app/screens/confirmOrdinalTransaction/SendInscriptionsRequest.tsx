import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import { type Transport } from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useSendInscriptions from './useSendInscriptions';

const LoaderContainer = styled.div(() => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

function SendInscriptionsRequest() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const {
    cancelOrdinalsTransferRequest,
    confirmOrdinalsTransferRequest,
    setFeeRate,
    getFeeForFeeRate,
    feeRate,
    isExecuting,
    isLoading,
    transaction,
    summary,
    txError,
  } = useSendInscriptions();

  const onClickCancel = async () => {
    await cancelOrdinalsTransferRequest();
    window.close();
  };

  const onClickConfirm = async (ledgerTransport?: Transport) => {
    const txid = await confirmOrdinalsTransferRequest(ledgerTransport);
    if (txid) {
      navigate('/tx-status', {
        state: {
          txid,
          currency: 'BTC',
          error: '',
          browserTx: true,
        },
      });
    }
  };

  return (
    <>
      {txError && <RequestError error={txError.message} onClose={onClickCancel} />}
      {!transaction && !txError && (
        <LoaderContainer>
          <Spinner size={50} />
        </LoaderContainer>
      )}
      {transaction && summary && !txError && (
        <ConfirmBtcTransaction
          showAccountHeader
          inputs={summary.inputs}
          outputs={summary.outputs}
          feeOutput={summary.feeOutput}
          showCenotaphCallout={!!summary?.runeOp?.Cenotaph?.flaws}
          isLoading={isLoading}
          confirmText={t('CONFIRM')}
          cancelText={t('CANCEL')}
          onCancel={onClickCancel}
          onConfirm={onClickConfirm}
          getFeeForFeeRate={getFeeForFeeRate}
          onFeeRateSet={(newFeeRate) => setFeeRate(newFeeRate.toString())}
          feeRate={+feeRate}
          isSubmitting={isExecuting}
          hideBottomBar
          isBroadcast
        />
      )}
    </>
  );
}

export default SendInscriptionsRequest;
