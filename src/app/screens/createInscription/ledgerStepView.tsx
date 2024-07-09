import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import { InscriptionErrorCode } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';

type Props = {
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
  errorCode?: InscriptionErrorCode;
};

function LedgerStepView({ isConnectSuccess, isConnectFailed, errorCode }: Props) {
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });

  let titleFailed = '';
  let textFailed = '';

  switch (errorCode) {
    case InscriptionErrorCode.DEVICE_LOCKED:
      titleFailed = signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE');
      textFailed = signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE_DEVICE_LOCKED');
      break;
    case InscriptionErrorCode.USER_REJECTED:
      titleFailed = signatureRequestTranslate('LEDGER.CONFIRM.DENIED.ERROR_TITLE');
      textFailed = signatureRequestTranslate('LEDGER.CONFIRM.DENIED.ERROR_SUBTITLE');
      break;
    case InscriptionErrorCode.GENERAL_LEDGER_ERROR:
      titleFailed = signatureRequestTranslate('LEDGER.CONFIRM.INVALID.ERROR_TITLE');
      textFailed = signatureRequestTranslate('LEDGER.CONFIRM.INVALID.ERROR_SUBTITLE');
      break;
    default:
      break;
  }

  if (titleFailed && textFailed) {
    return (
      <LedgerConnectionView
        title={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
        text={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
        titleFailed={titleFailed}
        textFailed={textFailed}
        imageDefault={ledgerConnectDefaultIcon}
        isConnectSuccess={false}
        isConnectFailed
      />
    );
  }

  if (isConnectSuccess) {
    return (
      <LedgerConnectionView
        title={signatureRequestTranslate('LEDGER.CONFIRM.TITLE')}
        text={signatureRequestTranslate('LEDGER.CONFIRM.SUBTITLE')}
        titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
        textFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
        imageDefault={ledgerConnectBtcIcon}
        isConnectSuccess
        isConnectFailed={false}
      />
    );
  }

  return (
    <LedgerConnectionView
      title={signatureRequestTranslate('LEDGER.CONNECT.TITLE')}
      text={signatureRequestTranslate('LEDGER.CONNECT.SUBTITLE', { name: 'Bitcoin' })}
      titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
      textFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
      imageDefault={ledgerConnectBtcIcon}
      isConnectSuccess={isConnectSuccess}
      isConnectFailed={isConnectFailed}
    />
  );
}

export default LedgerStepView;
