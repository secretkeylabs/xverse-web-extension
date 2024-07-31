import { getPopupPayload, type Context } from '@common/utils/popup';
import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import RequestError from '@components/requests/requestError';
import {
  transferRunesRequestSchema,
  type TransferRunesRequest as TTransferRunesRequest,
} from '@sats-connect/core';
import { type Transport } from '@secretkeylabs/xverse-core';
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
  data: TTransferRunesRequest;
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
    runesSummary,
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

  const onClickConfirm = async (ledgerTransport?: Transport) => {
    const txid = await confirmRunesTransferRequest(ledgerTransport);
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
          runeSummary={runesSummary}
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
  const [error, data] = getPopupPayload(v.parser(transferRunesRequestSchema));
  if (error) {
    throw new Error('Invalid payload');
  }

  return <TransferRunesRequestInner data={data.data} context={data.context} />;
}

export default TransferRunesRequest;
