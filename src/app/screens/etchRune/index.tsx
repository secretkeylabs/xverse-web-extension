import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import useSelectedAccount from '@hooks/useSelectedAccount';
import type { Transport } from '@secretkeylabs/xverse-core';
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
  const { btcAddress, ordinalsAddress } = useSelectedAccount();
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

  const onClickConfirm = async (ledgerTransport?: Transport) => {
    const txid = await payAndConfirmEtchRequest(ledgerTransport);
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
          summary={orderTx.summary}
          runeEtchDetails={etchRequest}
          feeRate={+feeRate}
          confirmText={t('CONFIRM')}
          cancelText={t('CANCEL')}
          isBroadcast
          isLoading={false}
          onCancel={onClickCancel}
          onConfirm={onClickConfirm}
          isSubmitting={isExecuting}
          hideBottomBar
          showAccountHeader
        />
      )}
    </>
  );
}

export default EtchRune;
