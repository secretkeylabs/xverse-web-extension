import keystoneConnectBtcIcon from '@assets/img/keystone/keystone_import_connect_btc.svg';
import keystoneImportStartIcon from '@assets/img/keystone/keystone_import_start.svg';
import ledgerAccountSwitchIcon from '@assets/img/ledger/account_switch.svg';
import btcIcon from '@assets/img/ledger/btc_icon.svg';
import btcOrdinalsIcon from '@assets/img/ledger/btc_ordinals_icon.svg';
import checkCircleIcon from '@assets/img/ledger/check_circle.svg';
import ordinalsIcon from '@assets/img/ledger/ordinals_icon.svg';
import LedgerFailView from '@components/ledger/failLedgerView';
import LedgerAddressComponent from '@components/ledger/ledgerAddressComponent';
import LedgerInput from '@components/ledger/ledgerInput';
import { useTranslation } from 'react-i18next';
import KeystoneConnectionView from '../../../../components/keystone/connectKeystoneView';
import { ImportKeystoneSteps } from '../types';

import KeystoneFailView from '@components/keystone/failKeystoneView';
import {
  AddAccountNameContainer,
  AddAccountNameTitleContainer,
  AddAddressDetailsContainer,
  AddAddressHeaderContainer,
  AddressAddedContainer,
  ConfirmationStep,
  ConfirmationStepsContainer,
  ConfirmationText,
  CreateAnotherAccountContainer,
  CreateMultipleAccountsText,
  CustomLink,
  EndScreenContainer,
  EndScreenTextContainer,
  ImportBeforeStartContainer,
  ImportBeforeStartText,
  ImportBeforeStartTitle,
  ImportCardContainer,
  ImportStartContainer,
  ImportStartImage,
  ImportStartText,
  ImportStartTitle,
  Option,
  OptionIcon,
  OptionsContainer,
  SelectAssetFootNote,
  SelectAssetText,
  SelectAssetTextContainer,
  SelectAssetTitle,
  TogglerContainer,
  TogglerText,
  WarningIcon,
} from './index.styled';

const LINK_TO_LEDGER_ACCOUNT_ISSUE_GUIDE =
  'https://support.xverse.app/hc/en-us/articles/17901278165773';
const LINK_TO_LEDGER_PASSPHRASE_GUIDE =
  'https://support.xverse.app/hc/en-us/articles/17901278165773';

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
    // case ImportKeystoneSteps.IMPORTANT_WARNING:
    //   return (
    //     <ImportBeforeStartContainer>
    //       <WarningIcon src={warningIcon} alt="Warning" />
    //       <ImportBeforeStartTitle>
    //         {t('KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TITLE')}
    //       </ImportBeforeStartTitle>
    //       {selectedLedgerLiveOption === LedgerLiveOptions.USING ? (
    //         <ImportBeforeStartText>
    //           {t('KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_1')}
    //           <br />
    //           <CustomLink
    //             href={LINK_TO_LEDGER_ACCOUNT_ISSUE_GUIDE}
    //             target="_blank"
    //             rel="noopener noreferrer"
    //           >
    //             {t('LEARN_MORE')}
    //           </CustomLink>
    //           <br />
    //           <br />
    //           {t('KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_2')}{' '}
    //           <CustomLink
    //             href={LINK_TO_LEDGER_PASSPHRASE_GUIDE}
    //             target="_blank"
    //             rel="noopener noreferrer"
    //           >
    //             {t('KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.PASSPHRASE_FOR_ORDINALS')}
    //           </CustomLink>
    //           .
    //           <br />
    //           <br />
    //           {t('KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_3')}
    //         </ImportBeforeStartText>
    //       ) : (
    //         <ImportBeforeStartText>
    //           {t('KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_1')}{' '}
    //           <CustomLink
    //             href={LINK_TO_LEDGER_ACCOUNT_ISSUE_GUIDE}
    //             target="_blank"
    //             rel="noopener noreferrer"
    //           >
    //             {t('LEARN_MORE')}
    //           </CustomLink>
    //           <br />
    //           <br />
    //           {t('KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_2')}{' '}
    //           <CustomLink
    //             href={LINK_TO_LEDGER_PASSPHRASE_GUIDE}
    //             target="_blank"
    //             rel="noopener noreferrer"
    //           >
    //             {t('KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.PASSPHRASE_FOR_ORDINALS')}
    //           </CustomLink>
    //           .
    //         </ImportBeforeStartText>
    //       )}
    //       <TogglerContainer>
    //         <Toggle
    //           onChange={() => setIsTogglerChecked(!isTogglerChecked)}
    //           checked={isTogglerChecked}
    //         />
    //         {selectedLedgerLiveOption === LedgerLiveOptions.USING ? (
    //           <TogglerText>
    //             {t('KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.UNDERSTAND_THE_RISKS')}
    //           </TogglerText>
    //         ) : (
    //           <TogglerText>
    //             {t(
    //               'KEYSTONE_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.UNDERSTAND_SHOULD_NOT_USE_LEDGER_LIVE',
    //             )}
    //           </TogglerText>
    //         )}
    //       </TogglerContainer>
    //     </ImportBeforeStartContainer>
    //   );
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
    case ImportKeystoneSteps.ADD_MULTIPLE_ACCOUNTS:
      return (
        <CreateAnotherAccountContainer>
          <img src={btcOrdinalsIcon} alt="bitcoin" />
          <SelectAssetTitle>{t('KEYSTONE_ADD_ADDRESS.TITLE_BTC')}</SelectAssetTitle>
          <CreateMultipleAccountsText>
            {t('KEYSTONE_ADD_ADDRESS.ALREADY_CONNECTED_WARNING')}
          </CreateMultipleAccountsText>
        </CreateAnotherAccountContainer>
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
