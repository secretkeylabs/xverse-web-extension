import InfoIcon from '@assets/img/info.svg';
import ledgerConnectDefaultIcon from '@assets/img/ledger/ledger_connect_default.svg';
import ledgerConnectBtcIcon from '@assets/img/ledger/ledger_import_connect_btc.svg';
import KeystoneScanSignature from '@components/keystone/ScanSignature';
import KeystoneViewTxQRCode from '@components/keystone/viewTxQRCode';
import LedgerConnectionView, {
  ConnectLedgerContainer,
  ConnectLedgerText,
} from '@components/ledger/connectLedgerView';
import LedgerFailView from '@components/ledger/failLedgerView';
import {
  ConnectLedgerTitle,
  InfoImage,
} from '@screens/ledger/confirmLedgerStxTransaction/index.styled';
import type {
  AggregatedSummary,
  btcTransaction,
  UserTransactionSummary,
} from '@secretkeylabs/xverse-core';
import type { TFunction } from 'react-i18next';

export enum KeystoneSteps {
  ViewTxQRCode = 0,
  ScanSignature = 1,
  ConfirmTransaction = 2,
}

type Props = {
  transaction?: btcTransaction.EnhancedTransaction;
  currentStep: KeystoneSteps;
  isConnectSuccess: boolean;
  isConnectFailed: boolean;
  isTxRejected: boolean;
  t: TFunction<'translation', 'CONFIRM_TRANSACTION'>;
  signatureRequestTranslate: TFunction<'translation', 'SIGNATURE_REQUEST'>;
};

function KeystoneStepView({
  transaction,
  currentStep,
  isConnectSuccess,
  isConnectFailed,
  isTxRejected,
  t,
  signatureRequestTranslate,
}: Props) {
  switch (currentStep) {
    case KeystoneSteps.ViewTxQRCode:
      return <KeystoneViewTxQRCode transaction={transaction} />;
    case KeystoneSteps.ScanSignature:
      if (isTxRejected || isConnectFailed) {
        return (
          <LedgerFailView title={t('CONFIRM.ERROR_TITLE')} text={t('CONFIRM.ERROR_SUBTITLE')} />
        );
      }

      return <KeystoneScanSignature transaction={transaction} />;
    case KeystoneSteps.ConfirmTransaction:
      return (
        <LedgerConnectionView
          title={signatureRequestTranslate('LEDGER.CONFIRM.TITLE')}
          text={signatureRequestTranslate('LEDGER.CONFIRM.SUBTITLE')}
          titleFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_TITLE')}
          textFailed={signatureRequestTranslate('LEDGER.CONFIRM.ERROR_SUBTITLE')}
          imageDefault={ledgerConnectDefaultIcon}
          isConnectSuccess={false}
          isConnectFailed={isTxRejected}
        />
      );
    default:
      return null;
  }
}

export default KeystoneStepView;
