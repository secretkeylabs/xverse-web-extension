import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  Account,
  getMasterFingerPrint,
  importNativeSegwitAccountFromLedger,
  importStacksAccountFromLedger,
  importTaprootAccountFromLedger,
} from '@secretkeylabs/xverse-core';
import useWalletReducer from '@hooks/useWalletReducer';
import { ledgerDelay } from '@common/utils/ledger';
import LedgerAddressComponent from '@components/ledger/ledgerAddressComponent';
import useWalletSelector from '@hooks/useWalletSelector';
import LedgerInput from '@components/ledger/ledgerInput';
import FullScreenHeader from '@components/ledger/fullScreenHeader';
import warningIcon from '@assets/img/Warning_red.svg';

import LedgerImportStartSVG from '@assets/img/ledger/ledger_import_start.svg';
import BtcOrdinalsIconSVG from '@assets/img/ledger/btc_ordinals_icon.svg';
import BtcIconSVG from '@assets/img/ledger/btc_icon.svg';
import OrdinalsIconSVG from '@assets/img/ledger/ordinals_icon.svg';
import StxIconSVG from '@assets/img/ledger/stx_icon.svg';
import LedgerConnectBtcSVG from '@assets/img/ledger/ledger_import_connect_btc.svg';
import LedgerConnectStxSVG from '@assets/img/ledger/ledger_import_connect_stx.svg';
import CheckCircleSVG from '@assets/img/ledger/check_circle.svg';
import LedgerAccountSwitchSVG from '@assets/img/ledger/account_switch.svg';
import ArrowLeftIconSVG from '@assets/img/ledger/arrow_left_icon.svg';
import LedgerFailView from '@components/ledger/failLedgerView';
import LedgerAssetSelectCard from '@components/ledger/ledgerAssetSelectCard';
import LedgerConnectionView from '../../../components/ledger/connectLedgerView';
import {
  AddAccountNameContainer,
  AddAccountNameTitleContainer,
  AddAddressDetailsContainer,
  AddAddressHeaderContainer,
  AddressAddedContainer,
  AssetSelectionButton,
  AssetSelectionButtonText,
  ButtonContainer,
  ConfirmationStep,
  ConfirmationStepsContainer,
  ConfirmationText,
  Container,
  CreateAnotherAccountContainer,
  CreateMultipleAccountsText,
  CustomLink,
  CustomSwitch,
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
  OnBoardingActionsContainer,
  OnBoardingContentContainer,
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

export interface Credential {
  publicKey: string;
  address: string;
}

type LedgerLiveOption = 'using' | 'not using';

function ImportLedger(): JSX.Element {
  const theme = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isBitcoinSelected, setIsBitcoinSelected] = useState(true);
  const [isStacksSelected, setIsStacksSelected] = useState(false);
  const [bitcoinCredentials, setBitcoinCredentials] = useState<Credential | undefined>(undefined);
  const [ordinalsCredentials, setOrdinalsCredentials] = useState<Credential | undefined>(undefined);
  const [stacksCredentials, setStacksCredentials] = useState<Credential | undefined>(undefined);
  const [masterPubKey, setMasterPubKey] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [accountId, setAccountId] = useState(0);
  const [accountName, setAccountName] = useState('');
  const [accountNameError, setAccountNameError] = useState<string | undefined>();
  const [isBtcAddressConfirmed, setIsBtcAddressConfirmed] = useState(false);
  const [isOrdinalsAddressConfirmed, setIsOrdinalsAddressConfirmed] = useState(false);
  const [isBtcAddressRejected, setIsBtcAddressRejected] = useState(false);
  const [isOrdinalsAddressRejected, setIsOrdinalsAddressRejected] = useState(false);
  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_IMPORT_SCREEN' });
  const { addLedgerAccount, updateLedgerAccounts } = useWalletReducer();
  const [selectedLedgerLiveOption, setSelectedLedgerLiveOption] = useState<LedgerLiveOption | null>(
    null,
  );
  const [isTogglerChecked, setIsTogglerChecked] = useState(false);
  const { ledgerAccountsList, network, selectedAccount } = useWalletSelector();
  const transition = useTransition(currentStepIndex, {
    from: {
      x: 24,
      opacity: 0,
    },
    enter: {
      x: 0,
      opacity: 1,
    },
  });

  const getNewAccountId = () => {
    if (ledgerAccountsList.length === 0) {
      return 0;
    }

    return ledgerAccountsList[ledgerAccountsList.length - 1].id + 1;
  };

  const getDeviceNewAccountIndex = (masterKey?: string) => {
    const ledgerAccountsIndexList = ledgerAccountsList
      .filter((account) => masterKey === account.masterPubKey)
      .map((account, key) =>
        account.deviceAccountIndex !== undefined ? account.deviceAccountIndex : key,
      )
      .sort((a, b) => a - b);

    for (let i = 0; i < ledgerAccountsIndexList.length; i += 1) {
      if (ledgerAccountsIndexList[i] !== i) {
        return i;
      }
    }

    // If no missing number is found, return the length of the array
    return ledgerAccountsIndexList.length;
  };

  const importBtcAccounts = async (showAddress: boolean, masterFingerPrint?: string) => {
    let btcCreds;
    let ordinalsCreds;
    const transport = await Transport.create();
    const newAccountId = getNewAccountId();
    setAccountId(newAccountId);
    const deviceNewAccountIndex = getDeviceNewAccountIndex(masterPubKey || masterFingerPrint);
    if (isBitcoinSelected) {
      try {
        const bitcoinAccount = await importNativeSegwitAccountFromLedger(
          transport,
          network.type,
          0,
          deviceNewAccountIndex,
          showAddress,
        );
        btcCreds = {
          address: bitcoinAccount.address,
          publicKey: bitcoinAccount.publicKey,
        };
        setBitcoinCredentials(btcCreds);
        if (showAddress) {
          setIsBtcAddressConfirmed(true);
          setCurrentStepIndex(3.5);
        }
      } catch (err: any) {
        if (err.statusCode === 27013) {
          setIsBtcAddressRejected(true);
        } else {
          setIsConnectFailed(true);
        }
        setIsButtonDisabled(false);
        await transport.close();
        return;
      }
      try {
        const ordinalsAccount = await importTaprootAccountFromLedger(
          transport,
          network.type,
          0,
          deviceNewAccountIndex,
          showAddress,
        );
        ordinalsCreds = {
          address: ordinalsAccount.address,
          publicKey: ordinalsAccount.publicKey,
        };
        setOrdinalsCredentials(ordinalsCreds);
        if (showAddress) {
          setIsOrdinalsAddressConfirmed(true);
        }
      } catch (err: any) {
        if (err.statusCode === 27013) {
          setIsOrdinalsAddressRejected(true);
        } else {
          setIsConnectFailed(true);
        }
        setIsButtonDisabled(false);
        await transport.close();
        return;
      }
    }
    await transport.close();

    return { btcCreds, ordinalsCreds, newAccountId };
  };

  const importStxAccounts = async (showAddress: boolean) => {
    setIsButtonDisabled(true);
    const transport = await Transport.create();

    try {
      const stacksCreds = await importStacksAccountFromLedger(
        transport,
        network.type,
        0,
        accountId,
        showAddress,
      );
      setStacksCredentials(stacksCreds);
      await transport.close();

      return stacksCreds;
    } catch (err: any) {
      console.error(err);
      setIsConnectFailed(true);
      setIsButtonDisabled(false);
      await transport.close();
    }
  };

  const handleClickNext = async () => {
    /*
      Go back to step 2 if user wants to add the stacks account as well
    */
    if (currentStepIndex === 4 && isBitcoinSelected && isStacksSelected) {
      setIsBitcoinSelected(false);
      setIsButtonDisabled(false);
      setIsConnectSuccess(false);
      setIsConnectFailed(false);

      setCurrentStepIndex(2);
      return;
    }

    if (currentStepIndex === 1) {
      setCurrentStepIndex(1.5);
      return;
    }

    if (currentStepIndex === 1.5) {
      setCurrentStepIndex(1.75);
      return;
    }

    if (currentStepIndex === 1.75) {
      setCurrentStepIndex(2);
      return;
    }

    setCurrentStepIndex(currentStepIndex + 1);
  };

  const saveAddressToWallet = async ({
    btcCreds,
    ordinalsCreds,
    stacksCreds,
    masterFingerPrint,
    newAccountId,
  }: {
    btcCreds?: Credential;
    ordinalsCreds?: Credential;
    stacksCreds?: Credential;
    masterFingerPrint?: string;
    newAccountId: number;
  }) => {
    setIsButtonDisabled(true);
    const currentAccount = ledgerAccountsList.find(
      (account) =>
        account.id === newAccountId && account.masterPubKey === (masterPubKey || masterFingerPrint),
    );

    try {
      if (!currentAccount) {
        const ledgerAccount: Account = {
          id: newAccountId,
          stxAddress: stacksCreds?.address || '',
          btcAddress: btcCreds?.address || '',
          ordinalsAddress: ordinalsCreds?.address || '',
          masterPubKey: masterPubKey || masterFingerPrint || '',
          stxPublicKey: stacksCreds?.publicKey || '',
          btcPublicKey: btcCreds?.publicKey || '',
          ordinalsPublicKey: ordinalsCreds?.publicKey || '',
          accountType: 'ledger',
          accountName: `Ledger Account ${newAccountId + 1}`,
          deviceAccountIndex: getDeviceNewAccountIndex(masterPubKey || masterFingerPrint),
        };
        await addLedgerAccount(ledgerAccount);
        await ledgerDelay(1000);
        setCurrentStepIndex(4);
        setIsButtonDisabled(false);
        return;
      }

      if (currentAccount && isBitcoinSelected) {
        const ledgerAccount: Account = {
          ...currentAccount,
          btcAddress: btcCreds?.address || '',
          btcPublicKey: btcCreds?.publicKey || '',
          ordinalsAddress: ordinalsCreds?.address || '',
          ordinalsPublicKey: ordinalsCreds?.publicKey || '',
        };
        await updateLedgerAccounts(ledgerAccount);
        await ledgerDelay(1000);
        setCurrentStepIndex(4);
        setIsButtonDisabled(false);
        return;
      }

      if (currentAccount && isStacksSelected) {
        const ledgerAccount: Account = {
          ...currentAccount,
          stxAddress: stacksCreds?.address || '',
          stxPublicKey: stacksCreds?.publicKey || '',
        };
        await updateLedgerAccounts(ledgerAccount);
        await ledgerDelay(1000);
        setCurrentStepIndex(4);
        setIsButtonDisabled(false);
      }

      await ledgerDelay(500);
      setIsButtonDisabled(false);
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
    }
  };

  const handleClickMultipleAccounts = async () => {
    try {
      setCurrentStepIndex(3);
      setIsButtonDisabled(true);
      if (!isStacksSelected) {
        const { btcCreds, ordinalsCreds, newAccountId } = await importBtcAccounts(true);
        await saveAddressToWallet({ btcCreds, ordinalsCreds, newAccountId });
      }
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    }
  };

  const fetchMasterPubKey = async () => {
    const transport = await Transport.create();
    const masterFingerPrint = await getMasterFingerPrint(transport);
    setMasterPubKey(masterFingerPrint);
    return masterFingerPrint;
  };

  const checkDeviceConnection = async () => {
    try {
      setIsConnectFailed(false);
      setIsBtcAddressRejected(false);
      setIsOrdinalsAddressRejected(false);
      setIsButtonDisabled(true);
      const masterFingerPrint = isBitcoinSelected
        ? await fetchMasterPubKey()
        : selectedAccount?.masterPubKey || masterPubKey;
      if (isBitcoinSelected) {
        await importBtcAccounts(false, masterFingerPrint);
      } else {
        await importStxAccounts(false);
      }
      setIsConnectSuccess(true);
      await ledgerDelay(1500);
      if (
        ledgerAccountsList?.find((account) => account.masterPubKey === masterFingerPrint) &&
        isBitcoinSelected
      ) {
        setIsButtonDisabled(false);
        setCurrentStepIndex(2.5);
        return;
      }
      handleClickNext();
      if (isBitcoinSelected) {
        const { btcCreds, ordinalsCreds, newAccountId } = await importBtcAccounts(
          true,
          masterFingerPrint,
        );
        await saveAddressToWallet({ btcCreds, ordinalsCreds, masterFingerPrint, newAccountId });
      } else {
        const stacksCreds = await importStxAccounts(true);
        await saveAddressToWallet({
          masterFingerPrint,
          newAccountId: accountId,
          stacksCreds,
        });
      }
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    }
  };

  const updateAccountName = async () => {
    if (accountName === '') {
      handleClickNext();
      return;
    }

    try {
      setIsButtonDisabled(true);
      const accountToUpdate = ledgerAccountsList.find(
        (account) => account.id === accountId && account.masterPubKey === masterPubKey,
      );
      if (!accountToUpdate) {
        throw new Error('Account not found');
      }
      const updatedAccount: Account = { ...accountToUpdate, accountName };
      await updateLedgerAccounts(updatedAccount);
      await ledgerDelay(1000);
      setIsButtonDisabled(false);
      handleClickNext();
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
    }
  };

  const handleWindowClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  const backToAssetSelection = () => {
    setIsStacksSelected(false);
    setBitcoinCredentials(undefined);
    setOrdinalsCredentials(undefined);
    setStacksCredentials(undefined);
    setIsButtonDisabled(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setAccountId(0);
    setAccountName('');

    setCurrentStepIndex(0);
  };

  const handleAssetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === 'stx_select_card') {
      setIsStacksSelected(!isStacksSelected);
    }
  };

  const validateAccountName = () => {
    if (accountName.length > 20) {
      setAccountNameError('Account name should be not longer than 20 characters.');
      return;
    }

    if (ledgerAccountsList.find((account) => account.accountName === accountName)) {
      setAccountNameError('Account with the same name already exists. Please choose another name.');
      return;
    }

    setAccountNameError(undefined);
  };

  useEffect(() => {
    validateAccountName();
  }, [accountName]);

  return (
    <Container>
      <FullScreenHeader />
      {currentStepIndex > 1 && (
        <AssetSelectionButton onClick={backToAssetSelection}>
          <img src={ArrowLeftIconSVG} alt="Go back" />
          <AssetSelectionButtonText>{t('LEDGER_IMPORT_RETURN_BUTTON')}</AssetSelectionButtonText>
        </AssetSelectionButton>
      )}
      {transition((style) => (
        <>
          <OnBoardingContentContainer
            className={[0, 2, 4, 6].includes(currentStepIndex) ? 'center' : ''}
            style={style}
          >
            {currentStepIndex === 0 && (
              <ImportStartContainer>
                <ImportStartImage src={LedgerImportStartSVG} />
                <ImportStartTitle>{t('LEDGER_IMPORT_1_TITLE')}</ImportStartTitle>
                <ImportStartText>{t('LEDGER_IMPORT_1_SUBTITLE')}</ImportStartText>
              </ImportStartContainer>
            )}
            {currentStepIndex === 1 && (
              <div>
                <SelectAssetTextContainer>
                  <SelectAssetTitle>{t('LEDGER_IMPORT_2_TITLE')}</SelectAssetTitle>
                  <SelectAssetText>{t('LEDGER_IMPORT_2_SUBTITLE')}</SelectAssetText>
                </SelectAssetTextContainer>

                <ImportCardContainer id="card_container">
                  <LedgerAssetSelectCard
                    icon={BtcOrdinalsIconSVG}
                    title={t('LEDGER_IMPORT_2_SELECT.BTC_TITLE')}
                    text={t('LEDGER_IMPORT_2_SELECT.BTC_SUBTITLE')}
                    id="btc_select_card"
                    isChecked={isBitcoinSelected}
                    onChange={handleAssetSelect}
                  />

                  <LedgerAssetSelectCard
                    icon={StxIconSVG}
                    title={t('LEDGER_IMPORT_2_SELECT.STACKS_TITLE')}
                    text={t('LEDGER_IMPORT_2_SELECT.STACKS_SUBTITLE')}
                    id="stx_select_card"
                    isChecked={isStacksSelected}
                    onChange={handleAssetSelect}
                  />
                  <SelectAssetFootNote>{t('LEDGER_IMPORT_2_FOOTNOTE')}</SelectAssetFootNote>
                </ImportCardContainer>
              </div>
            )}
            {currentStepIndex === 1.5 && (
              <ImportBeforeStartContainer>
                <ImportBeforeStartTitle>
                  {t('LEDGER_BEFORE_GETTING_STARTED.TITLE')}
                </ImportBeforeStartTitle>
                <ImportBeforeStartText>
                  {t('LEDGER_BEFORE_GETTING_STARTED.DESCRIPTION')}
                </ImportBeforeStartText>
                <OptionsContainer>
                  <Option
                    onClick={() => setSelectedLedgerLiveOption('using')}
                    selected={selectedLedgerLiveOption === 'using'}
                  >
                    <OptionIcon selected={selectedLedgerLiveOption === 'using'} />
                    {t('LEDGER_BEFORE_GETTING_STARTED.OPTIONS.USE_LEDGER_LIVE')}
                  </Option>
                  <Option
                    onClick={() => setSelectedLedgerLiveOption('not using')}
                    selected={selectedLedgerLiveOption === 'not using'}
                  >
                    <OptionIcon selected={selectedLedgerLiveOption === 'not using'} />
                    {t('LEDGER_BEFORE_GETTING_STARTED.OPTIONS.DONT_USE_LEDGER_LIVE')}
                  </Option>
                </OptionsContainer>
              </ImportBeforeStartContainer>
            )}
            {currentStepIndex === 1.75 && (
              <ImportBeforeStartContainer>
                <WarningIcon src={warningIcon} alt="Warning" />
                <ImportBeforeStartTitle>
                  {t('LEDGER_BEFORE_GETTING_STARTED.IMPORTANT_WARNING.TITLE')}
                </ImportBeforeStartTitle>
                {selectedLedgerLiveOption === 'using' ? (
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
                  <CustomSwitch
                    onColor={theme.colors.purple_main}
                    offColor={theme.colors.background.elevation3}
                    onChange={() => setIsTogglerChecked(!isTogglerChecked)}
                    checked={isTogglerChecked}
                    uncheckedIcon={false}
                    checkedIcon={false}
                  />
                  {selectedLedgerLiveOption === 'using' ? (
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
            )}
            {currentStepIndex === 2 && (
              <LedgerConnectionView
                title={t(
                  isBitcoinSelected ? 'LEDGER_CONNECT.BTC_TITLE' : 'LEDGER_CONNECT.STX_TITLE',
                )}
                text={t(
                  isBitcoinSelected ? 'LEDGER_CONNECT.BTC_SUBTITLE' : 'LEDGER_CONNECT.STX_SUBTITLE',
                )}
                titleFailed={t('LEDGER_CONNECT.TITLE_FAILED')}
                textFailed={t(
                  isBitcoinSelected
                    ? 'LEDGER_CONNECT.BTC_SUBTITLE_FAILED'
                    : 'LEDGER_CONNECT.STX_SUBTITLE_FAILED',
                )}
                imageDefault={isBitcoinSelected ? LedgerConnectBtcSVG : LedgerConnectStxSVG}
                isConnectSuccess={isConnectSuccess}
                isConnectFailed={isConnectFailed}
              />
            )}
            {currentStepIndex === 2.5 && (
              <CreateAnotherAccountContainer>
                <img
                  src={isBitcoinSelected ? BtcOrdinalsIconSVG : StxIconSVG}
                  alt={isBitcoinSelected ? 'bitcoin' : 'stacks'}
                />
                <SelectAssetTitle>
                  {t(
                    isBitcoinSelected
                      ? 'LEDGER_ADD_ADDRESS.TITLE_BTC'
                      : 'LEDGER_ADD_ADDRESS.TITLE_STX',
                  )}
                </SelectAssetTitle>
                <CreateMultipleAccountsText>
                  {t('LEDGER_ADD_ADDRESS.ALREADY_CONNECTED_WARNING')}
                </CreateMultipleAccountsText>
              </CreateAnotherAccountContainer>
            )}
            {currentStepIndex === 3 &&
              (isConnectFailed || isBtcAddressRejected ? (
                <LedgerFailView
                  title={t(
                    isBtcAddressRejected
                      ? 'LEDGER_ADD_ADDRESS.TITLE_CANCELLED'
                      : 'LEDGER_CONNECT.TITLE_FAILED',
                  )}
                  text={t(
                    isBtcAddressRejected
                      ? 'LEDGER_ADD_ADDRESS.SUBTITLE_CANCELLED'
                      : 'LEDGER_CONNECT.BTC_SUBTITLE_FAILED',
                  )}
                />
              ) : (
                <>
                  <AddAddressHeaderContainer>
                    <img
                      src={isBitcoinSelected ? BtcIconSVG : StxIconSVG}
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
                      <ConfirmationStep isCompleted={isBtcAddressConfirmed} />
                      <ConfirmationStep isCompleted={isOrdinalsAddressConfirmed} />
                    </ConfirmationStepsContainer>
                  )}
                </>
              ))}
            {currentStepIndex === 3.5 &&
              (isConnectFailed || isOrdinalsAddressRejected ? (
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
              ) : (
                <>
                  <AddAddressHeaderContainer>
                    <img src={OrdinalsIconSVG} width={32} height={32} alt="ordinals" />
                    <SelectAssetTitle>
                      {t('LEDGER_ADD_ADDRESS.TITLE_VERIFY_ORDINALS')}
                    </SelectAssetTitle>
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
                    <ConfirmationStep isCompleted={isBtcAddressConfirmed} />
                    <ConfirmationStep isCompleted={isOrdinalsAddressConfirmed} />
                  </ConfirmationStepsContainer>
                </>
              ))}
            {currentStepIndex === 4 && (
              <AddressAddedContainer>
                <img src={CheckCircleSVG} alt="Success" />
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
            )}
            {currentStepIndex === 5 && (
              <AddAccountNameContainer>
                <AddAccountNameTitleContainer>
                  <SelectAssetTitle>{t('LEDGER_ADD_ACCOUNT_NAME.TITLE')}</SelectAssetTitle>
                  <SelectAssetText>{t('LEDGER_ADD_ACCOUNT_NAME.SUBTITLE')}</SelectAssetText>
                </AddAccountNameTitleContainer>
                <LedgerInput
                  label={t('LEDGER_ADD_ACCOUNT_NAME.INPUT')}
                  placeholder={`My ledger ${accountId + 1}`}
                  id="account_name_input"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  error={accountNameError}
                />
              </AddAccountNameContainer>
            )}
            {currentStepIndex === 6 && (
              <EndScreenContainer>
                <EndScreenTextContainer>
                  <SelectAssetTitle>{t('LEDGER_IMPORT_END.TITLE')}</SelectAssetTitle>
                  <SelectAssetText>{t('LEDGER_IMPORT_END.SUBTITLE')}</SelectAssetText>
                </EndScreenTextContainer>
                <img src={LedgerAccountSwitchSVG} alt="Wallet created" />
              </EndScreenContainer>
            )}
          </OnBoardingContentContainer>
          <OnBoardingActionsContainer>
            {currentStepIndex === 0 && (
              <ActionButton onPress={handleClickNext} text={t('LEDGER_IMPORT_1_BUTTON')} />
            )}
            {currentStepIndex === 1 && (
              <ActionButton
                onPress={handleClickNext}
                text={t('LEDGER_IMPORT_CONTINUE_BUTTON')}
                disabled={!isBitcoinSelected && !isStacksSelected}
              />
            )}
            {currentStepIndex === 1.5 && (
              <ActionButton
                onPress={handleClickNext}
                text={t('LEDGER_IMPORT_CONTINUE_BUTTON')}
                disabled={selectedLedgerLiveOption === null}
              />
            )}
            {currentStepIndex === 1.75 && (
              <ActionButton
                onPress={handleClickNext}
                text={t('LEDGER_IMPORT_CONTINUE_BUTTON')}
                disabled={!isTogglerChecked}
              />
            )}
            {currentStepIndex === 2 && (
              <ActionButton
                processing={isButtonDisabled}
                disabled={isButtonDisabled}
                onPress={checkDeviceConnection}
                text={t(
                  isConnectFailed
                    ? 'LEDGER_IMPORT_TRY_AGAIN_BUTTON'
                    : 'LEDGER_IMPORT_CONNECT_BUTTON',
                )}
              />
            )}
            {currentStepIndex === 2.5 && (
              <>
                <ButtonContainer>
                  <ActionButton
                    disabled={isButtonDisabled}
                    processing={isButtonDisabled}
                    onPress={backToAssetSelection}
                    transparent
                    text={t('LEDGER_IMPORT_CANCEL_BUTTON')}
                  />
                </ButtonContainer>
                <ButtonContainer>
                  <ActionButton
                    disabled={isButtonDisabled}
                    processing={isButtonDisabled}
                    onPress={handleClickMultipleAccounts}
                    text={t('LEDGER_IMPORT_YES_BUTTON')}
                  />
                </ButtonContainer>
              </>
            )}
            {(currentStepIndex === 3 || currentStepIndex === 3.5) &&
              (isConnectFailed || isBtcAddressRejected || isOrdinalsAddressRejected) && (
                <ActionButton
                  processing={isButtonDisabled}
                  disabled={isButtonDisabled}
                  onPress={backToAssetSelection}
                  text={t('LEDGER_IMPORT_TRY_AGAIN_BUTTON')}
                />
              )}
            {currentStepIndex === 4 && (
              <ActionButton onPress={handleClickNext} text={t('LEDGER_IMPORT_NEXT_BUTTON')} />
            )}
            {currentStepIndex === 5 && (
              <ActionButton
                disabled={isButtonDisabled || !!accountNameError}
                processing={isButtonDisabled}
                onPress={updateAccountName}
                text={t('LEDGER_IMPORT_CONFIRM_BUTTON')}
              />
            )}
            {currentStepIndex === 6 && (
              <ActionButton
                disabled={isButtonDisabled}
                processing={isButtonDisabled}
                onPress={handleWindowClose}
                text={t('LEDGER_IMPORT_CLOSE_BUTTON')}
              />
            )}
          </OnBoardingActionsContainer>
        </>
      ))}
    </Container>
  );
}

export default ImportLedger;
