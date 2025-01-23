import keystoneConnectDefaultIcon from '@assets/img/hw/keystone/keystone_connect_default.svg';
import keystoneConnectBtcIcon from '@assets/img/hw/keystone/keystone_import_connect_btc.svg';
import KeystoneConnectionView from '@components/keystone/connectKeystoneView';
import { ExecuteTransferProgressCodes } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';

type Props = {
  currentStep: ExecuteTransferProgressCodes | undefined;
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
  isDeviceLocked: boolean;
};

function KeystoneStepView({
  currentStep,
  isConnectSuccess,
  isConnectFailed,
  isDeviceLocked,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'EXECUTE_BRC20' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });

  if (isDeviceLocked) {
    return (
      <KeystoneConnectionView
        title={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
        text={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
        titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
        textFailed={signatureRequestTranslate('LEDGER.CONNECT.DEVICE_LOCKED')}
        imageDefault={keystoneConnectDefaultIcon}
        isConnectSuccess={false}
        isConnectFailed
      />
    );
  }

  switch (currentStep) {
    case undefined:
      // we haven't started yet, so we need to connect
      return (
        <KeystoneConnectionView
          title={signatureRequestTranslate('KEYSTONE.CONNECT.TITLE')}
          text={signatureRequestTranslate('KEYSTONE.CONNECT.SUBTITLE', { name: 'Bitcoin' })}
          titleFailed={signatureRequestTranslate('KEYSTONE.CONNECT.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('KEYSTONE.CONNECT.ERROR_SUBTITLE')}
          imageDefault={keystoneConnectBtcIcon}
          isConnectSuccess={isConnectSuccess}
          isConnectFailed={isConnectFailed}
        />
      );
    case ExecuteTransferProgressCodes.CreatingCommitTransaction:
      return (
        <KeystoneConnectionView
          title={t('KEYSTONE.INSCRIPTION.TITLE')}
          text={t('KEYSTONE.INSCRIPTION.SUBTITLE')}
          titleFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_SUBTITLE')}
          imageDefault={keystoneConnectDefaultIcon}
          isConnectSuccess={false}
          isConnectFailed={isConnectFailed}
        />
      );
    case ExecuteTransferProgressCodes.CreatingTransferTransaction:
      return (
        <KeystoneConnectionView
          title={t('KEYSTONE.TRANSFER.TITLE')}
          text={t('KEYSTONE.TRANSFER.SUBTITLE')}
          titleFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_SUBTITLE')}
          imageDefault={keystoneConnectDefaultIcon}
          isConnectSuccess={false}
          isConnectFailed={isConnectFailed}
        />
      );
    default:
      return null;
  }
}

export default KeystoneStepView;
