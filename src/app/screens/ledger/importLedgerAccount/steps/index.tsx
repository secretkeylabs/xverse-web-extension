import warningIcon from '@assets/img/Warning_red.svg';
import stxIcon from '@assets/img/dashboard/stx_icon.svg';
import ledgerAccountSwitchIcon from '@assets/img/hw/account_switch.svg';
import btcIcon from '@assets/img/hw/ledger/btc_icon.svg';
import btcOrdinalsIcon from '@assets/img/hw/ledger/btc_ordinals_icon.svg';
import checkCircleIcon from '@assets/img/hw/ledger/check_circle.svg';
import ledgerConnectBtcIcon from '@assets/img/hw/ledger/ledger_import_connect_btc.svg';
import ledgerConnectStxIcon from '@assets/img/hw/ledger/ledger_import_connect_stx.svg';
import ledgerImportStartIcon from '@assets/img/hw/ledger/ledger_import_start.svg';
import ordinalsIcon from '@assets/img/hw/ledger/ordinals_icon.svg';
import LedgerFailView from '@components/ledger/failLedgerView';
import LedgerAddressComponent from '@components/ledger/ledgerAddressComponent';
import LedgerAssetSelectCard from '@components/ledger/ledgerAssetSelectCard';
import LedgerInput from '@components/ledger/ledgerInput';
import { useTranslation } from 'react-i18next';
import LedgerConnectionView from '../../../../components/ledger/connectLedgerView';
import { ImportLedgerSteps, LedgerLiveOptions } from '../types';

import Toggle from '@ui-library/toggle';
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
  'https://support.xverse.app/hc/en-us/articles/17898446492557';
const LINK_TO_LEDGER_PASSPHRASE_GUIDE =
  'https://support.xverse.app/hc/en-us/articles/17901278165773';

type Props = {
  isConnectSuccess: boolean;
  isBitcoinSelected: boolean;
  isStacksSelected: boolean;
  isTogglerChecked: boolean;
  isBtcAddressConfirmed: boolean;
  isOrdinalsAddressConfirmed: boolean;
  currentStep: ImportLedgerSteps;
  accountName: string;
  accountId: number;
  selectedLedgerLiveOption: LedgerLiveOptions | null;
  handleAssetSelect: (selectedAsset: 'Bitcoin' | 'Stacks') => void;
  setSelectedLedgerLiveOption: (option: LedgerLiveOptions) => void;
  setIsTogglerChecked: (checked: boolean) => void;
  setAccountName: (name: string) => void;
  creds: {
    bitcoinCredentials: any;
    ordinalsCredentials: any;
    stacksCredentials: any;
  };
  errors: {
    isConnectFailed: boolean;
    isBtcAddressRejected: boolean;
    isOrdinalsAddressRejected: boolean;
    isStxAddressRejected: boolean;
    accountNameError?: string;
  };
};

function Steps({
  isConnectSuccess,
  isBitcoinSelected,
  isStacksSelected,
  isTogglerChecked,
  isBtcAddressConfirmed,
  isOrdinalsAddressConfirmed,
  currentStep,
  accountName,
  accountId,
  selectedLedgerLiveOption,
  handleAssetSelect,
  setSelectedLedgerLiveOption,
  setIsTogglerChecked,
  setAccountName,
  creds,
  errors,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_IMPORT_SCREEN' });
  const { bitcoinCredentials, ordinalsCredentials, stacksCredentials } = creds;
  const {
    isConnectFailed,
    isBtcAddressRejected,
    isOrdinalsAddressRejected,
    isStxAddressRejected,
    accountNameError,
  } = errors;

  switch (currentStep) {
    case ImportLedgerSteps.START:
      return (
        <ImportStartContainer>
          <ImportStartImage src={ledgerImportStartIcon} />
          <ImportStartTitle>{t('LEDGER_IMPORT_1_TITLE')}</ImportStartTitle>
          <ImportStartText>{t('LEDGER_IMPORT_1_SUBTITLE')}</ImportStartText>
        </ImportStartContainer>
      );
    case ImportLedgerSteps.SELECT_ASSET:
      return (
        <div>
          <SelectAssetTextContainer>
            <SelectAssetTitle>{t('LEDGER_IMPORT_2_TITLE')}</SelectAssetTitle>
            <SelectAssetText>{t('LEDGER_IMPORT_2_SUBTITLE')}</SelectAssetText>
          </SelectAssetTextContainer>

          <ImportCardContainer>
            <LedgerAssetSelectCard
              icon={btcOrdinalsIcon}
              title={t('LEDGER_IMPORT_2_SELECT.BTC_TITLE')}
              text={t('LEDGER_IMPORT_2_SELECT.BTC_SUBTITLE')}
              name="Bitcoin"
              isChecked={isBitcoinSelected}
              onClick={handleAssetSelect}
            />

            <LedgerAssetSelectCard
              icon={stxIcon}
              title={t('LEDGER_IMPORT_2_SELECT.STACKS_TITLE')}
              text={t('LEDGER_IMPORT_2_SELECT.STACKS_SUBTITLE')}
              name="Stacks"
              isChecked={isStacksSelected}
              onClick={handleAssetSelect}
              squareIcon
            />
            <SelectAssetFootNote>{t('LEDGER_IMPORT_2_FOOTNOTE')}</SelectAssetFootNote>
          </ImportCardContainer>
        </div>
      );
    case ImportLedgerSteps.BEFORE_START:
      return (
        <ImportBeforeStartContainer>
          <ImportBeforeStartTitle>
            {t('LEDGER_BEFORE_GETTING_STARTED.TITLE')}
          </ImportBeforeStartTitle>
          <ImportBeforeStartText>
            {t('LEDGER_BEFORE_GETTING_STARTED.DESCRIPTION')}
          </ImportBeforeStartText>
          <OptionsContainer>
            <Option
              onClick={() => setSelectedLedgerLiveOption(LedgerLiveOptions.USING)}
              $selected={selectedLedgerLiveOption === LedgerLiveOptions.USING}
            >
              <OptionIcon $selected={selectedLedgerLiveOption === LedgerLiveOptions.USING} />
              {t('LEDGER_BEFORE_GETTING_STARTED.OPTIONS.USE_LEDGER_LIVE')}
            </Option>
            <Option
              onClick={() => setSelectedLedgerLiveOption(LedgerLiveOptions.NOT_USING)}
              $selected={selectedLedgerLiveOption === LedgerLiveOptions.NOT_USING}
            >
              <OptionIcon $selected={selectedLedgerLiveOption === LedgerLiveOptions.NOT_USING} />
              {t('LEDGER_BEFORE_GETTING_STARTED.OPTIONS.DONT_USE_LEDGER_LIVE')}
            </Option>
          </OptionsContainer>
        </ImportBeforeStartContainer>
      );
    case ImportLedgerSteps.IMPORTANT_WARNING:
      return (
        <ImportBeforeStartContainer>
          <WarningIcon src={warningIcon} alt="Warning" />
          <ImportBeforeStartTitle>
            {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TITLE')}
          </ImportBeforeStartTitle>
          {selectedLedgerLiveOption === LedgerLiveOptions.USING ? (
            <ImportBeforeStartText>
              {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_1')}
              <br />
              <CustomLink
                href={LINK_TO_LEDGER_ACCOUNT_ISSUE_GUIDE}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('LEARN_MORE')}
              </CustomLink>
              <br />
              <br />
              {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_2')}{' '}
              <CustomLink
                href={LINK_TO_LEDGER_PASSPHRASE_GUIDE}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.PASSPHRASE_FOR_ORDINALS')}
              </CustomLink>
              .
              <br />
              <br />
              {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_3')}
            </ImportBeforeStartText>
          ) : (
            <ImportBeforeStartText>
              {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_1')}{' '}
              <CustomLink
                href={LINK_TO_LEDGER_ACCOUNT_ISSUE_GUIDE}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('LEARN_MORE')}
              </CustomLink>
              <br />
              <br />
              {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TEXT_2')}{' '}
              <CustomLink
                href={LINK_TO_LEDGER_PASSPHRASE_GUIDE}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.PASSPHRASE_FOR_ORDINALS')}
              </CustomLink>
              .
            </ImportBeforeStartText>
          )}
          <TogglerContainer>
            <Toggle
              onChange={() => setIsTogglerChecked(!isTogglerChecked)}
              checked={isTogglerChecked}
            />
            {selectedLedgerLiveOption === LedgerLiveOptions.USING ? (
              <TogglerText>
                {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.UNDERSTAND_THE_RISKS')}
              </TogglerText>
            ) : (
              <TogglerText>
                {t(
                  'LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.UNDERSTAND_SHOULD_NOT_USE_LEDGER_LIVE',
                )}
              </TogglerText>
            )}
          </TogglerContainer>
        </ImportBeforeStartContainer>
      );
    case ImportLedgerSteps.CONNECT_LEDGER:
      return (
        <LedgerConnectionView
          title={t(isBitcoinSelected ? 'LEDGER_CONNECT.BTC_TITLE' : 'LEDGER_CONNECT.STX_TITLE')}
          text={t(
            isBitcoinSelected ? 'LEDGER_CONNECT.BTC_SUBTITLE' : 'LEDGER_CONNECT.STX_SUBTITLE',
          )}
          titleFailed={t('LEDGER_CONNECT.TITLE_FAILED')}
          textFailed={t(
            isBitcoinSelected
              ? 'LEDGER_CONNECT.BTC_SUBTITLE_FAILED'
              : 'LEDGER_CONNECT.STX_SUBTITLE_FAILED',
          )}
          imageDefault={isBitcoinSelected ? ledgerConnectBtcIcon : ledgerConnectStxIcon}
          isConnectSuccess={isConnectSuccess}
          isConnectFailed={isConnectFailed}
        />
      );
    case ImportLedgerSteps.ADD_MULTIPLE_ACCOUNTS:
      return (
        <CreateAnotherAccountContainer>
          <img
            src={isBitcoinSelected ? btcOrdinalsIcon : stxIcon}
            alt={isBitcoinSelected ? 'bitcoin' : 'stacks'}
          />
          <SelectAssetTitle>
            {t(isBitcoinSelected ? 'LEDGER_ADD_ADDRESS.TITLE_BTC' : 'LEDGER_ADD_ADDRESS.TITLE_STX')}
          </SelectAssetTitle>
          <CreateMultipleAccountsText>
            {t('LEDGER_ADD_ADDRESS.ALREADY_CONNECTED_WARNING')}
          </CreateMultipleAccountsText>
        </CreateAnotherAccountContainer>
      );
    case ImportLedgerSteps.ADD_ADDRESS:
      if (isConnectFailed || isBtcAddressRejected || isStxAddressRejected) {
        return (
          <LedgerFailView
            title={t(
              isBtcAddressRejected || isStxAddressRejected
                ? 'LEDGER_ADD_ADDRESS.TITLE_CANCELLED'
                : 'LEDGER_CONNECT.TITLE_FAILED',
            )}
            text={t(
              isBtcAddressRejected || isStxAddressRejected
                ? 'LEDGER_ADD_ADDRESS.SUBTITLE_CANCELLED'
                : 'LEDGER_CONNECT.BTC_SUBTITLE_FAILED',
            )}
          />
        );
      }

      return (
        <>
          <AddAddressHeaderContainer>
            <img
              src={isBitcoinSelected ? btcIcon : stxIcon}
              width={32}
              height={32}
              alt={isBitcoinSelected ? 'bitcoin' : 'stacks'}
            />
            <SelectAssetTitle>
              {t(
                isBitcoinSelected
                  ? 'LEDGER_ADD_ADDRESS.TITLE_VERIFY_BTC'
                  : 'LEDGER_ADD_ADDRESS.TITLE_STX',
              )}
            </SelectAssetTitle>
          </AddAddressHeaderContainer>
          <AddAddressDetailsContainer>
            <SelectAssetText centered>{t('LEDGER_ADD_ADDRESS.SUBTITLE')}</SelectAssetText>
            {isBitcoinSelected ? (
              <LedgerAddressComponent
                title={t('LEDGER_ADD_ADDRESS.BTC')}
                address={bitcoinCredentials?.address}
              />
            ) : (
              <LedgerAddressComponent
                title={t('LEDGER_ADD_ADDRESS.STX')}
                address={stacksCredentials?.address}
              />
            )}
          </AddAddressDetailsContainer>
          <ConfirmationText>{t('LEDGER_ADD_ADDRESS.CONFIRM_TO_CONTINUE')}</ConfirmationText>
          {isBitcoinSelected && (
            <ConfirmationStepsContainer>
              <ConfirmationStep $isCompleted={isBtcAddressConfirmed} />
              <ConfirmationStep $isCompleted={isOrdinalsAddressConfirmed} />
            </ConfirmationStepsContainer>
          )}
        </>
      );
    case ImportLedgerSteps.ADD_ORDINALS_ADDRESS:
      if (isConnectFailed || isOrdinalsAddressRejected) {
        return (
          <LedgerFailView
            title={t(
              isOrdinalsAddressRejected
                ? 'LEDGER_ADD_ADDRESS.TITLE_CANCELLED'
                : 'LEDGER_CONNECT.TITLE_FAILED',
            )}
            text={t(
              isOrdinalsAddressRejected
                ? 'LEDGER_ADD_ADDRESS.SUBTITLE_CANCELLED'
                : 'LEDGER_CONNECT.BTC_SUBTITLE_FAILED',
            )}
          />
        );
      }

      return (
        <>
          <AddAddressHeaderContainer>
            <img src={ordinalsIcon} width={32} height={32} alt="ordinals" />
            <SelectAssetTitle>{t('LEDGER_ADD_ADDRESS.TITLE_VERIFY_ORDINALS')}</SelectAssetTitle>
          </AddAddressHeaderContainer>
          <AddAddressDetailsContainer>
            <SelectAssetText>{t('LEDGER_ADD_ADDRESS.SUBTITLE')}</SelectAssetText>
            <LedgerAddressComponent
              title={t('LEDGER_ADD_ADDRESS.ORDINALS')}
              address={ordinalsCredentials?.address}
            />
          </AddAddressDetailsContainer>
          <ConfirmationText>{t('LEDGER_ADD_ADDRESS.CONFIRM_TO_CONTINUE')}</ConfirmationText>
          <ConfirmationStepsContainer>
            <ConfirmationStep $isCompleted={isBtcAddressConfirmed} />
            <ConfirmationStep $isCompleted={isOrdinalsAddressConfirmed} />
          </ConfirmationStepsContainer>
        </>
      );
    case ImportLedgerSteps.ADDRESS_ADDED:
      return (
        <AddressAddedContainer>
          <img src={checkCircleIcon} alt="Success" />
          <SelectAssetTitle>
            {t(
              isBitcoinSelected
                ? 'LEDGER_ADDRESS_ADDED.TITLE_BTC_ORDINALS'
                : 'LEDGER_ADDRESS_ADDED.TITLE_STX',
            )}
          </SelectAssetTitle>
          <SelectAssetText centered>
            {t(
              isBitcoinSelected
                ? 'LEDGER_ADDRESS_ADDED.SUBTITLE'
                : 'LEDGER_ADDRESS_ADDED.SUBTITLE_STX',
            )}
          </SelectAssetText>
        </AddressAddedContainer>
      );
    case ImportLedgerSteps.ADD_ACCOUNT_NAME:
      return (
        <AddAccountNameContainer>
          <AddAccountNameTitleContainer>
            <SelectAssetTitle>{t('LEDGER_ADD_ACCOUNT_NAME.TITLE')}</SelectAssetTitle>
            <SelectAssetText>{t('LEDGER_ADD_ACCOUNT_NAME.SUBTITLE')}</SelectAssetText>
          </AddAccountNameTitleContainer>
          <LedgerInput
            label={t('LEDGER_ADD_ACCOUNT_NAME.INPUT')}
            placeholder={`${t('LEDGER_ADD_ACCOUNT_NAME.PLACEHOLDER')} ${accountId + 1}`}
            id="account_name_input"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            error={accountNameError}
          />
        </AddAccountNameContainer>
      );
    case ImportLedgerSteps.IMPORT_END:
      return (
        <EndScreenContainer>
          <EndScreenTextContainer>
            <SelectAssetTitle>{t('LEDGER_IMPORT_END.TITLE')}</SelectAssetTitle>
            <SelectAssetText>{t('LEDGER_IMPORT_END.SUBTITLE')}</SelectAssetText>
          </EndScreenTextContainer>
          <img src={ledgerAccountSwitchIcon} alt="Wallet created" />
        </EndScreenContainer>
      );
    default:
      return null;
  }
}

export default Steps;
