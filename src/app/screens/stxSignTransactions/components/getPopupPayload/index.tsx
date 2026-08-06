import { usePopupPayload } from '@common/utils/popup/usePopupPayload';
import { stxSignTransactionsRequestMessageSchema } from '@sats-connect/core';
import * as v from 'valibot';
import { Loader } from './components/loader';
import { PopupPayloadError } from './components/popupPayloadError';

export function GetPopupPayload() {
  const payloadState = usePopupPayload(v.parser(stxSignTransactionsRequestMessageSchema));

  if (payloadState.status === 'loading') {
    return null;
  }

  if (payloadState.status === 'error') {
    return <PopupPayloadError error={payloadState.error} />;
  }

  return <Loader context={payloadState.context} data={payloadState.data} />;
}
