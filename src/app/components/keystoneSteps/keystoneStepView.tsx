import keystoneConnectDefaultIcon from '@assets/img/hw/keystone/keystone_connect_default.svg';
import keystoneConnectBtcIcon from '@assets/img/hw/keystone/keystone_import_connect_btc.svg';
import KeystoneConnectionView from '@components/keystone/connectKeystoneView';
import type { TFunction } from 'react-i18next';

export enum Steps {
  ConnectKeystone = 0,
  ConfirmTransaction = 1,
}

type Props = {
  currentStep: Steps;
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
  isTxRejected: boolean;
  signatureRequestTranslate: TFunction<'translation', 'SIGNATURE_REQUEST'>;
  txnToSignCount?: number;
  txnSignIndex?: number;
};

function KeystoneStepView({
  currentStep,
  isConnectSuccess,
  isConnectFailed,
  isTxRejected,
  signatureRequestTranslate,
  txnToSignCount,
  txnSignIndex,
}: Props) {
  switch (currentStep) {
    case Steps.ConnectKeystone:
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
    case Steps.ConfirmTransaction: {
      let title = signatureRequestTranslate('KEYSTONE.CONFIRM.TITLE');
      if (txnToSignCount && txnSignIndex && txnToSignCount > 1) {
        title = signatureRequestTranslate('KEYSTONE.CONFIRM.TITLE_WITH_COUNT', {
          current: txnSignIndex,
          total: txnToSignCount,
        });
      }
      return (
        <KeystoneConnectionView
          title={title}
          text={signatureRequestTranslate('KEYSTONE.CONFIRM.SUBTITLE')}
          titleFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('KEYSTONE.CONFIRM.ERROR_SUBTITLE')}
          imageDefault={keystoneConnectDefaultIcon}
          isConnectSuccess={false}
          isConnectFailed={isTxRejected}
        />
      );
    }
    default:
      return null;
  }
}

export default KeystoneStepView;
