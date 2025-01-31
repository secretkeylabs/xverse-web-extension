import ledgerConnectDefaultIcon from '@assets/img/hw/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/hw/ledger/ledger_import_connect_btc.svg';
import InfoIcon from '@assets/img/info.svg';
import LedgerConnectionView, {
  ConnectLedgerContainer,
  ConnectLedgerText,
} from '@components/ledger/connectLedgerView';
import LedgerFailView from '@components/ledger/failLedgerView';
import {
  ConnectLedgerTitle,
  InfoImage,
} from '@screens/ledger/confirmLedgerStxTransaction/index.styled';
import type { TFunction } from 'react-i18next';

export enum Steps {
  ConnectLedger = 0,
  ExternalInputs = 1,
  ConfirmTransaction = 2,
}

type Props = {
  currentStep: Steps;
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
  isTxRejected: boolean;
  t: TFunction<'translation', 'CONFIRM_TRANSACTION'>;
  signatureRequestTranslate: TFunction<'translation', 'SIGNATURE_REQUEST'>;
  txnToSignCount?: number;
  txnSignIndex?: number;
};

function LedgerStepView({
  currentStep,
  isConnectSuccess,
  isConnectFailed,
  isTxRejected,
  t,
  signatureRequestTranslate,
  txnToSignCount,
  txnSignIndex,
}: Props) {
  switch (currentStep) {
    case Steps.ConnectLedger:
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
    case Steps.ExternalInputs:
      if (isTxRejected || isConnectFailed) {
        return (
          <LedgerFailView title={t('CONFIRM.ERROR_TITLE')} text={t('CONFIRM.ERROR_SUBTITLE')} />
        );
      }

      return (
        <div>
          <ConnectLedgerContainer>
            <InfoImage src={InfoIcon} alt="external inputs warning" />
            <ConnectLedgerTitle textAlign="center">
              {t('LEDGER.INPUTS_WARNING.EXTERNAL_INPUTS')} / <br />
              {t('LEDGER.INPUTS_WARNING.NON_DEFAULT_SIGHASH')}
            </ConnectLedgerTitle>
            <ConnectLedgerText>{t('LEDGER.INPUTS_WARNING.SUBTITLE')}</ConnectLedgerText>
          </ConnectLedgerContainer>
        </div>
      );
    case Steps.ConfirmTransaction: {
      let title = signatureRequestTranslate('LEDGER.CONFIRM.TITLE');
      if (txnToSignCount && txnSignIndex && txnToSignCount > 1) {
        title = signatureRequestTranslate('LEDGER.CONFIRM.TITLE_WITH_COUNT', {
          current: txnSignIndex,
          total: txnToSignCount,
        });
      }
      return (
        <LedgerConnectionView
          title={title}
          text={signatureRequestTranslate('LEDGER.CONFIRM.SUBTITLE')}
          titleFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_SUBTITLE')}
          imageDefault={ledgerConnectDefaultIcon}
          isConnectSuccess={false}
          isConnectFailed={isTxRejected}
        />
      );
    }
    default:
      return null;
  }
}

export default LedgerStepView;
