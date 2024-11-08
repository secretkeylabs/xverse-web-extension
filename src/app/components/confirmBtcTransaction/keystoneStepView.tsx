import keystoneConnectDefaultIcon from '@assets/img/keystone/keystone_connect_default.svg';
import keystoneConnectBtcIcon from '@assets/img/keystone/keystone_import_connect_btc.svg';
import KeystoneConnectionView from '@components/keystone/connectKeystoneView';
import type { TFunction } from 'react-i18next';

export enum KeystoneSteps {
  ConnectKeystone = 0,
  ConfirmTransaction = 1,
}

type Props = {
  currentStep: KeystoneSteps;
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
  isTxRejected: boolean;
  signatureRequestTranslate: TFunction<'translation', 'SIGNATURE_REQUEST'>;
};

function KeystoneStepView({
  currentStep,
  isConnectSuccess,
  isConnectFailed,
  isTxRejected,
  signatureRequestTranslate,
}: Props) {
  switch (currentStep) {
    case KeystoneSteps.ConnectKeystone:
      return (
        <KeystoneConnectionView
          title={signatureRequestTranslate('KEYSTONE.CONNECT.TITLE')}
          text={signatureRequestTranslate('KEYSTONE.CONNECT.SUBTITLE')}
          titleFailed={signatureRequestTranslate('KEYSTONE.CONNECT.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('KEYSTONE.CONNECT.ERROR_SUBTITLE')}
          imageDefault={keystoneConnectBtcIcon}
          isConnectSuccess={isConnectSuccess}
          isConnectFailed={isConnectFailed}
        />
      );
    case KeystoneSteps.ConfirmTransaction:
      return (
        <KeystoneConnectionView
          title={signatureRequestTranslate('KEYSTONE.CONFIRM.TITLE')}
          text={signatureRequestTranslate('KEYSTONE.CONFIRM.SUBTITLE')}
          titleFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_SUBTITLE')}
          imageDefault={keystoneConnectDefaultIcon}
          isConnectSuccess={false}
          isConnectFailed={isTxRejected}
        />
      );
    default:
      return null;
  }
}

export default KeystoneStepView;
