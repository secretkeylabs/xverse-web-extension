import keystoneConnectDefaultIcon from '@assets/img/hw/keystone/keystone_connect_default.svg';
import keystoneConnectBtcIcon from '@assets/img/hw/keystone/keystone_import_connect_btc.svg';
import ledgerConnectDefaultIcon from '@assets/img/hw/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/hw/ledger/ledger_import_connect_btc.svg';
import KeystoneConnectionView from '@components/keystone/connectKeystoneView';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import { InscriptionErrorCode } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';

type Props = {
  walletCode: 'LEDGER' | 'KEYSTONE';
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
  errorCode?: InscriptionErrorCode;
};

// TODO: refactor this to a central component that is more generic when we add a third HW wallet
function HardwareWalletStepView({
  walletCode,
  isConnectSuccess,
  isConnectFailed,
  errorCode,
}: Props) {
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });
  const DisplayConnectionView =
    walletCode === 'LEDGER' ? LedgerConnectionView : KeystoneConnectionView;

  const defaultIcon =
    walletCode === 'LEDGER' ? ledgerConnectDefaultIcon : keystoneConnectDefaultIcon;
  const btcIcon = walletCode === 'LEDGER' ? ledgerConnectBtcIcon : keystoneConnectBtcIcon;

  let titleFailed = '';
  let textFailed = '';

  switch (errorCode) {
    case InscriptionErrorCode.DEVICE_LOCKED:
      titleFailed = signatureRequestTranslate(`${walletCode}.CONNECT.ERROR_TITLE`);
      textFailed = signatureRequestTranslate(`${walletCode}.CONNECT.ERROR_SUBTITLE_DEVICE_LOCKED`);
      break;
    case InscriptionErrorCode.USER_REJECTED:
      titleFailed = signatureRequestTranslate(`${walletCode}.CONFIRM.DENIED.ERROR_TITLE`);
      textFailed = signatureRequestTranslate(`${walletCode}.CONFIRM.DENIED.ERROR_SUBTITLE`);
      break;
    case InscriptionErrorCode.GENERAL_HARDWARE_WALLET_ERROR:
      titleFailed = signatureRequestTranslate(`${walletCode}.CONFIRM.INVALID.ERROR_TITLE`);
      textFailed = signatureRequestTranslate(`${walletCode}.CONFIRM.INVALID.ERROR_SUBTITLE`);
      break;
    default:
      break;
  }

  if (titleFailed && textFailed) {
    return (
      <DisplayConnectionView
        title={signatureRequestTranslate(`${walletCode}.CONNECT.ERROR_TITLE`)}
        text={signatureRequestTranslate(`${walletCode}.CONNECT.ERROR_SUBTITLE`)}
        titleFailed={titleFailed}
        textFailed={textFailed}
        imageDefault={defaultIcon}
        isConnectSuccess={false}
        isConnectFailed
      />
    );
  }

  if (isConnectSuccess) {
    return (
      <DisplayConnectionView
        title={signatureRequestTranslate(`${walletCode}.CONFIRM.TITLE`)}
        text={signatureRequestTranslate(`${walletCode}.CONFIRM.SUBTITLE`)}
        titleFailed={signatureRequestTranslate(`${walletCode}.CONNECT.ERROR_TITLE`)}
        textFailed={signatureRequestTranslate(`${walletCode}.CONNECT.ERROR_SUBTITLE`)}
        imageDefault={btcIcon}
        isConnectSuccess
        isConnectFailed={false}
      />
    );
  }

  return (
    <DisplayConnectionView
      title={signatureRequestTranslate(`${walletCode}.CONNECT.TITLE`)}
      text={signatureRequestTranslate(`${walletCode}.CONNECT.SUBTITLE', { name: 'Bitcoin' `)}
      titleFailed={signatureRequestTranslate(`${walletCode}.CONNECT.ERROR_TITLE`)}
      textFailed={signatureRequestTranslate(`${walletCode}.CONNECT.ERROR_SUBTITLE`)}
      imageDefault={btcIcon}
      isConnectSuccess={isConnectSuccess}
      isConnectFailed={isConnectFailed}
    />
  );
}

export default HardwareWalletStepView;
