import { getPopupPayload } from '@common/utils/popup';
import { stxSignTransactionsRequestMessageSchema } from '@sats-connect/core';
import * as v from 'valibot';
import { Loader } from './components/loader';
import { PopupPayloadError } from './components/popupPayloadError';

export function GetPopupPayload() {
  const [error, popupPayload] = getPopupPayload(v.parser(stxSignTransactionsRequestMessageSchema));
  if (error) return <PopupPayloadError error={error} />;

  return <Loader {...popupPayload} />;
}
