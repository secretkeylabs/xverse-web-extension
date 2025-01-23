import ledgerConnectDefaultIcon from '@assets/img/hw/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/hw/ledger/ledger_import_connect_btc.svg';
import LedgerConnectionView from '@components/ledger/connectLedgerView';
import { ExecuteTransferProgressCodes } from '@secretkeylabs/xverse-core';
import { useTranslation } from 'react-i18next';

type Props = {
  currentStep: ExecuteTransferProgressCodes | undefined;
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
  isDeviceLocked: boolean;
};

function LedgerStepView({ currentStep, isConnectSuccess, isConnectFailed, isDeviceLocked }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'EXECUTE_BRC20' });
  const { t: signatureRequestTranslate } = useTranslation('translation', {
    keyPrefix: 'SIGNATURE_REQUEST',
  });

  if (isDeviceLocked) {
    return (
      <LedgerConnectionView
        title={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
        text={signatureRequestTranslate('LEDGER.CONNECT.ERROR_SUBTITLE')}
        titleFailed={signatureRequestTranslate('LEDGER.CONNECT.ERROR_TITLE')}
        textFailed={signatureRequestTranslate('LEDGER.CONNECT.DEVICE_LOCKED')}
        imageDefault={ledgerConnectDefaultIcon}
        isConnectSuccess={false}
        isConnectFailed
      />
    );
  }

  switch (currentStep) {
    case undefined:
      // we haven't started yet, so we need to connect
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
    case ExecuteTransferProgressCodes.CreatingCommitTransaction:
      return (
        <LedgerConnectionView
          title={t('LEDGER.INSCRIPTION.TITLE')}
          text={t('LEDGER.INSCRIPTION.SUBTITLE')}
          titleFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_SUBTITLE')}
          imageDefault={ledgerConnectDefaultIcon}
          isConnectSuccess={false}
          isConnectFailed={isConnectFailed}
        />
      );
    case ExecuteTransferProgressCodes.CreatingTransferTransaction:
      return (
        <LedgerConnectionView
          title={t('LEDGER.TRANSFER.TITLE')}
          text={t('LEDGER.TRANSFER.SUBTITLE')}
          titleFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_SUBTITLE')}
          imageDefault={ledgerConnectDefaultIcon}
          isConnectSuccess={false}
          isConnectFailed={isConnectFailed}
        />
      );
    default:
      return null;
  }
}

export default LedgerStepView;
