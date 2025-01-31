import { getPopupPayload, type Context } from '@common/utils/popup';
import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import {
  runesTransferRequestMessageSchema,
  type RunesTransferRequestMessage,
} from '@sats-connect/core';
import { type KeystoneTransport, type LedgerTransport } from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as v from 'valibot';
import useTransferRunes from './useTransferRunesRequest';

const LoaderContainer = styled.div(() => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

type TransferRunesRequestInnerProps = {
  context: Context;
  data: RunesTransferRequestMessage;
};
function TransferRunesRequestInner({ data, context }: TransferRunesRequestInnerProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const {
    cancelRunesTransferRequest,
    confirmRunesTransferRequest,
    setFeeRate,
    getFeeForFeeRate,
    feeRate,
    isExecuting,
    isLoading,
    transaction,
    summary,
    txError,
  } = useTransferRunes({
    tabId: context.tabId,
    messageId: data.id,
    recipients: data.params.recipients,
  });

  const onClickCancel = async () => {
    await cancelRunesTransferRequest();
    window.close();
  };

  const onClickConfirm = async (options?: {
    ledgerTransport?: LedgerTransport;
    keystoneTransport?: KeystoneTransport;
  }) => {
    const txid = await confirmRunesTransferRequest(options);
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
          summary={summary}
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

function TransferRunesRequest() {
  const [error, data] = getPopupPayload(v.parser(runesTransferRequestMessageSchema));
  if (error) {
    throw new Error('Invalid payload');
  }

  return <TransferRunesRequestInner data={data.data} context={data.context} />;
}

export default TransferRunesRequest;
