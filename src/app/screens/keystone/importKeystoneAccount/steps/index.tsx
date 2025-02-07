import ledgerAccountSwitchIcon from '@assets/img/hw/account_switch.svg';
import keystoneConnectBtcIcon from '@assets/img/hw/keystone/keystone_import_connect_btc.svg';
import keystoneImportStartIcon from '@assets/img/hw/keystone/keystone_import_start.svg';
import checkCircleIcon from '@assets/img/hw/ledger/check_circle.svg';
import LedgerInput from '@components/ledger/ledgerInput';
import { useTranslation } from 'react-i18next';
import KeystoneConnectionView from '../../../../components/keystone/connectKeystoneView';
import { ImportKeystoneSteps } from '../types';

import {
  AddAccountNameContainer,
  AddAccountNameTitleContainer,
  AddressAddedContainer,
  EndScreenContainer,
  EndScreenTextContainer,
  ImportStartContainer,
  ImportStartImage,
  ImportStartText,
  ImportStartTitle,
  SelectAssetText,
  SelectAssetTitle,
} from './index.styled';

type Props = {
  isConnectSuccess: boolean;
  currentStep: ImportKeystoneSteps;
  accountName: string;
  accountId: number;
  setAccountName: (name: string) => void;
  errors: {
    isConnectFailed: boolean;
    connectFailedText?: string;
    accountNameError?: string;
  };
};

function Steps({
  isConnectSuccess,
  currentStep,
  accountName,
  accountId,
  setAccountName,
  errors,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'KEYSTONE_IMPORT_SCREEN' });
  const { isConnectFailed, connectFailedText, accountNameError } = errors;

  switch (currentStep) {
    case ImportKeystoneSteps.START:
      return (
        <ImportStartContainer>
          <ImportStartImage src={keystoneImportStartIcon} />
          <ImportStartTitle>{t('KEYSTONE_IMPORT_1_TITLE')}</ImportStartTitle>
          <ImportStartText>{t('KEYSTONE_IMPORT_1_SUBTITLE')}</ImportStartText>
        </ImportStartContainer>
      );
    case ImportKeystoneSteps.CONNECT_KEYSTONE:
      return (
        <KeystoneConnectionView
          title={t('KEYSTONE_CONNECT.BTC_TITLE')}
          text={t('KEYSTONE_CONNECT.BTC_SUBTITLE')}
          titleFailed={t('KEYSTONE_CONNECT.TITLE_FAILED')}
          textFailed={connectFailedText || t('KEYSTONE_CONNECT.BTC_SUBTITLE_FAILED')}
          imageDefault={keystoneConnectBtcIcon}
          isConnectSuccess={isConnectSuccess}
          isConnectFailed={isConnectFailed}
        />
      );
    case ImportKeystoneSteps.ADDRESS_ADDED:
      return (
        <AddressAddedContainer>
          <img src={checkCircleIcon} alt="Success" />
          <SelectAssetTitle>{t('KEYSTONE_ADDRESS_ADDED.TITLE_BTC')}</SelectAssetTitle>
          <SelectAssetText centered>{t('KEYSTONE_ADDRESS_ADDED.SUBTITLE')}</SelectAssetText>
        </AddressAddedContainer>
      );
    case ImportKeystoneSteps.ADD_ACCOUNT_NAME:
      return (
        <AddAccountNameContainer>
          <AddAccountNameTitleContainer>
            <SelectAssetTitle>{t('KEYSTONE_ADD_ACCOUNT_NAME.TITLE')}</SelectAssetTitle>
            <SelectAssetText>{t('KEYSTONE_ADD_ACCOUNT_NAME.SUBTITLE')}</SelectAssetText>
          </AddAccountNameTitleContainer>
          <LedgerInput
            label={t('KEYSTONE_ADD_ACCOUNT_NAME.INPUT')}
            placeholder={`${t('KEYSTONE_ADD_ACCOUNT_NAME.PLACEHOLDER')} ${accountId + 1}`}
            id="account_name_input"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            error={accountNameError}
          />
        </AddAccountNameContainer>
      );
    case ImportKeystoneSteps.IMPORT_END:
      return (
        <EndScreenContainer>
          <EndScreenTextContainer>
            <SelectAssetTitle>{t('KEYSTONE_IMPORT_END.TITLE')}</SelectAssetTitle>
            <SelectAssetText>{t('KEYSTONE_IMPORT_END.SUBTITLE')}</SelectAssetText>
          </EndScreenTextContainer>
          <img src={ledgerAccountSwitchIcon} alt="Wallet created" />
        </EndScreenContainer>
      );
    default:
      return null;
  }
}

export default Steps;
