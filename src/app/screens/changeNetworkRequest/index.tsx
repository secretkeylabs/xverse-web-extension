import { getPopupPayload } from '@common/utils/popup';
import { changeNetworkRequestMessageSchema } from '@sats-connect/core';

import * as v from 'valibot';

import { useTranslation } from 'react-i18next';
import ChangeNetworkRequestInner from './changeNetworkRequestInner';

function ChangeNetworkRequest() {
  const { t } = useTranslation();
  const [, popupPayload] = getPopupPayload(v.parser(changeNetworkRequestMessageSchema));

  if (!popupPayload) {
    return <div>{t('CHANGE_NETWORK_REQUEST.ERROR_WITH_REQUEST_PAYLOAD')}</div>;
  }

  return <ChangeNetworkRequestInner data={popupPayload.data} context={popupPayload.context} />;
}

export default ChangeNetworkRequest;
