import { getPopupPayload } from '@common/utils/popup';
import { changeNetworkRequestMessageSchema } from '@sats-connect/core';

import * as v from 'valibot';

import ChangeNetworkRequestInner from './changeNetworkRequestInner';

function ChangeNetworkRequest() {
  const [, popupPayload] = getPopupPayload(v.parser(changeNetworkRequestMessageSchema));

  if (!popupPayload) {
    return <div>Error processing change connection request.</div>;
  }

  return <ChangeNetworkRequestInner data={popupPayload.data} context={popupPayload.context} />;
}

export default ChangeNetworkRequest;
