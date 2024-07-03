import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import Spinner from '@ui-library/spinner';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useEtchRequest from './useEtchRequest';

const LoaderContainer = styled.div(() => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

function EtchRune() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const {
    etchRequest,
    orderTx,
    feeRate,
    etchError,
    isExecuting,
    handleEtch,
    payAndConfirmEtchRequest,
    cancelEtchRequest,
  } = useEtchRequest();

  const createAndLoadOrder = useCallback(async () => {
    await handleEtch();
  }, []);

  useEffect(() => {
    createAndLoadOrder();
  }, [createAndLoadOrder]);

  const onClickCancel = async () => {
    await cancelEtchRequest();
    window.close();
  };

  const onClickConfirm = async () => {
    const txid = await payAndConfirmEtchRequest();
    navigate('/tx-status', {
      state: {
        txid,
        currency: 'BTC',
        error: '',
        browserTx: true,
      },
    });
  };

  return (
    <>
      {etchError && <RequestError error={etchError.message} onClose={onClickCancel} />}
      {!orderTx && !etchError && (
        <LoaderContainer>
          <Spinner size={50} />
        </LoaderContainer>
      )}
      {orderTx && orderTx.summary && !etchError && (
        <ConfirmBtcTransaction
          inputs={orderTx.summary.inputs}
          outputs={orderTx.summary.outputs}
          feeOutput={orderTx.summary.feeOutput}
          feeRate={+feeRate}
          showCenotaphCallout={false}
          confirmText={t('CONFIRM')}
          cancelText={t('CANCEL')}
          isBroadcast
          isLoading={false}
          onCancel={onClickCancel}
          onConfirm={onClickConfirm}
          runeSummary={{
            etch: etchRequest,
            burns: [],
            receipts: [],
            transfers: [],
            inputsHadRunes: false,
          }}
          isSubmitting={isExecuting}
          hideBottomBar
          showAccountHeader
        />
      )}
    </>
  );
}

export default EtchRune;
