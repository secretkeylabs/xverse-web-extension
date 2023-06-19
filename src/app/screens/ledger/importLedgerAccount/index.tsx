import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { animated, useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  Account,
  importNativeSegwitAccountFromLedger,
  importStacksAccountFromLedger,
  importTaprootAccountFromLedger,
} from '@secretkeylabs/xverse-core';
import useWalletReducer from '@hooks/useWalletReducer';
import { ledgerDelay } from '@common/utils/ledger';
import LedgerAssetSelectCard from '@components/ledger/ledgerAssetSelectCard';
import LedgerAddressComponent from '@components/ledger/ledgerAddressComponent';
import useWalletSelector from '@hooks/useWalletSelector';
import LedgerInput from '@components/ledger/ledgerInput';
import FullScreenHeader from '@components/ledger/fullScreenHeader';

import LedgerImportStartSVG from '@assets/img/ledger/ledger_import_start.svg';
import BtcOdrinalsIconSVG from '@assets/img/ledger/btc_ordinals_icon.svg';
import StxIconSVG from '@assets/img/ledger/stx_icon.svg';
import LedgerConnectBtcSVG from '@assets/img/ledger/ledger_import_connect_btc.svg';
import LedgerConnectStxSVG from '@assets/img/ledger/ledger_import_connect_stx.svg';
import InfoIconSVG from '@assets/img/ledger/info_icon.svg';
import CheckCircleSVG from '@assets/img/ledger/check_circle.svg';
import LedgerImportEndSVG from '@assets/img/ledger/ledger_import_end.svg';
import ArrowLeftIconSVG from '@assets/img/ledger/arrow_left_icon.svg';
import LedgerConnectionView from '../../../components/ledger/connectLedgerView';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const OnBoardingContentContainer = styled(animated.div)((props) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  flex: 1,
  justifyContent: props.className === 'center' ? 'center' : 'none',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));
const OnBoardingActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(30),
}));
const ImportStartImage = styled.img((props) => ({
  marginLeft: props.theme.spacing(0),
}));

const ImportStartContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '328px',
}));

const ImportStartTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(30),
  textAlign: 'center',
}));
const ImportStartText = styled.p((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  marginTop: props.theme.spacing(6),
}));

const ImportCardContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
}));

const SelectAssetTextContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(16),
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
}));

const SelectAssetTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));
const SelectAssetText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
}));

const SelectAssetFootNote = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[200],
  marginBottom: props.theme.spacing(25),
  marginTop: props.theme.spacing(12),
}));

const AddAddressHeaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: props.theme.spacing(8),
  paddingTop: props.theme.spacing(20),
  marginBottom: props.theme.spacing(16),
}));

const CreateAnotherAccountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: props.theme.spacing(8),
  paddingTop: props.theme.spacing(90),
  marginBottom: props.theme.spacing(16),
}));

const AddAddressDetailsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: props.theme.spacing(12),
}));

const AlertContainer = styled.div((props) => ({
  marginTop: 'auto',
  marginBottom: props.theme.spacing(12),
  width: '100%',
  padding: props.theme.spacing(8),
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.spacing(10),
  alignItems: 'center',
  borderRadius: props.theme.radius(2),
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const AddressAddedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  > :first-child {
    margin-bottom: 26px;
  }
`;

const AddAccountNameContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
}));

const AddAccountNameTitleContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(4),
  marginBottom: props.theme.spacing(22),
}));

const CreateMultipleAccountsText = styled.h3((props) => ({
  ...props.theme.body_l,
  textAlign: 'center',
}));

const EndScreenContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const EndScreenTextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: props.theme.spacing(6),
  marginTop: props.theme.spacing(20),
}));

const AssetSelectionButton = styled.button((props) => ({
  position: 'absolute',
  left: props.theme.spacing(105),
  top: props.theme.spacing(60),
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: props.theme.spacing(3),
}));
const AssetSelectionButtonText = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[0],
}));

interface Credential {
  publicKey: string;
  address: string;
}

function ImportLedger(): JSX.Element {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isBitcoinSelected, setIsBitcoinSelected] = useState(true);
  const [isStacksSelected, setIsStacksSelected] = useState(false);
  const [bitcoinCredentials, setBitcoinCredentials] = useState<Credential | undefined>(undefined);
  const [ordinalsCredentials, setOrdinalsCredentials] = useState<Credential | undefined>(undefined);
  const [stacksCredentials, setStacksCredentials] = useState<Credential | undefined>(undefined);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState(false);
  const [isConnectFailed, setIsConnectFailed] = useState(false);
  const [addressIndex, setAddressIndex] = useState(0);
  const [accountName, setAccountName] = useState<string>('');
  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_IMPORT_SCREEN' });
  const { addLedgerAccount, updateLedgerAccounts } = useWalletReducer();
  const { ledgerAccountsList, network } = useWalletSelector();
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

  const importBtcAccounts = async () => {
    const transport = await Transport.create();
    const newAddressIndex = ledgerAccountsList.filter(
      (account) => account.btcAddress !== '',
    ).length;
    setAddressIndex(newAddressIndex);
    if (isBitcoinSelected) {
      const bitcoinAccount = await importNativeSegwitAccountFromLedger(
        transport,
        network.type,
        0,
        newAddressIndex,
        false,
      );
      setBitcoinCredentials({
        address: bitcoinAccount.address,
        publicKey: bitcoinAccount.publicKey,
      });
      const ordinalsAccount = await importTaprootAccountFromLedger(
        transport,
        network.type,
        0,
        newAddressIndex,
        false,
      );
      setOrdinalsCredentials({
        address: ordinalsAccount.address,
        publicKey: ordinalsAccount.publicKey,
      });
    }
    await transport.close();
  };

  const importStxAccounts = async () => {
    const transport = await Transport.create();
    const newAddressIndex = ledgerAccountsList.filter(
      (account) => account.stxAddress !== '',
    ).length;
    setAddressIndex(newAddressIndex);
    const { address, publicKey } = await importStacksAccountFromLedger(
      transport,
      network.type,
      0,
      newAddressIndex,
    );
    setStacksCredentials({
      address,
      publicKey,
    });
    await transport.close();
  };

  const handleSkipToEnd = () => {
    setCurrentStepIndex(6);
  };

  const handleClickNext = () => {
    /*
    Skip if Ledger account exists with the current account index
    (i.e. either STX or BTC address already present for the account)
    */
    if (currentStepIndex === 4) {
      const currentAccount = ledgerAccountsList.find((account) => account.id === addressIndex);
      if (currentAccount && currentAccount.stxAddress && currentAccount.btcAddress) {
        handleSkipToEnd();
        return;
      }
    }
    if (currentStepIndex === 2 && ledgerAccountsList.length !== 0) {
      setCurrentStepIndex(2.5);
    } else { setCurrentStepIndex(currentStepIndex + 1); }
  };

  const handleClickMultipleAccounts = () => {
    setCurrentStepIndex(3);
  };

  const checkDeviceConnection = async () => {
    try {
      setIsConnectFailed(false);
      setIsButtonDisabled(true);
      if (isStacksSelected) {
        await importStxAccounts();
      } else {
        await importBtcAccounts();
      }
      setIsConnectSuccess(true);
      await ledgerDelay(1500);
      handleClickNext();
      setIsButtonDisabled(false);
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
      setIsConnectSuccess(false);
      setIsConnectFailed(true);
    }
  };

  const saveAddressToWallet = async () => {
    setIsButtonDisabled(true);
    const currentAccount = ledgerAccountsList.find((account) => account.id === addressIndex);
    try {
      if (!currentAccount) {
        const ledgerAccount: Account = {
          id: addressIndex,
          stxAddress: stacksCredentials?.address || '',
          btcAddress: bitcoinCredentials?.address || '',
          ordinalsAddress: ordinalsCredentials?.address || '',
          masterPubKey: '',
          stxPublicKey: stacksCredentials?.publicKey || '',
          btcPublicKey: bitcoinCredentials?.publicKey || '',
          ordinalsPublicKey: ordinalsCredentials?.publicKey || '',
          accountType: 'ledger',
          accountName: `Ledger Account ${addressIndex + 1}`,
        };
        await addLedgerAccount(ledgerAccount);
        await ledgerDelay(1000);
        handleClickNext();
        setIsButtonDisabled(false);
        return;
      }

      if (currentAccount && isStacksSelected) {
        const ledgerAccount: Account = {
          ...currentAccount,
          stxAddress: stacksCredentials?.address || '',
          stxPublicKey: stacksCredentials?.publicKey || '',
        };
        await updateLedgerAccounts(ledgerAccount);
        await ledgerDelay(1000);
        handleClickNext();
        setIsButtonDisabled(false);
        return;
      }

      if (currentAccount && isBitcoinSelected) {
        const ledgerAccount: Account = {
          ...currentAccount,
          btcAddress: bitcoinCredentials?.address || '',
          btcPublicKey: bitcoinCredentials?.publicKey || '',
          ordinalsAddress: ordinalsCredentials?.address || '',
          ordinalsPublicKey: ordinalsCredentials?.publicKey || '',
        };
        await updateLedgerAccounts(ledgerAccount);
        await ledgerDelay(1000);
        handleClickNext();
        setIsButtonDisabled(false);
        return;
      }

      await ledgerDelay(500);
      handleClickNext();
      setIsButtonDisabled(false);
    } catch (err) {
      console.error(err);
      setIsButtonDisabled(false);
    }
  };

  const updateAccountName = async () => {
    if (accountName === '') {
      handleClickNext();
      return;
    }

    try {
      setIsButtonDisabled(true);
      const accountToUpdate = ledgerAccountsList.find((account) => account.id === addressIndex);
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
    setIsBitcoinSelected(true);
    setIsStacksSelected(false);
    setBitcoinCredentials(undefined);
    setOrdinalsCredentials(undefined);
    setStacksCredentials(undefined);
    setIsButtonDisabled(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setAddressIndex(0);
    setAccountName('');

    setCurrentStepIndex(1);
  };

  const handleAssetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.id) {
      case 'stx_select_card': {
        setIsStacksSelected(!isStacksSelected);
        if (isBitcoinSelected) {
          setIsBitcoinSelected(false);
        }
        break;
      }
      case 'btc_select_card': {
        setIsBitcoinSelected(!isBitcoinSelected);
        if (isStacksSelected) {
          setIsStacksSelected(false);
        }
        break;
      }
      default:
        break;
    }
  };

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
                    icon={BtcOdrinalsIconSVG}
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
            {currentStepIndex === 2 && (
              <LedgerConnectionView
                title={t(
                  isStacksSelected ? 'LEDGER_CONNECT.STX_TITLE' : 'LEDGER_CONNECT.BTC_TITLE',
                )}
                text={t(
                  isStacksSelected ? 'LEDGER_CONNECT.STX_SUBTITLE' : 'LEDGER_CONNECT.BTC_SUBTITLE',
                )}
                titleFailed={t('LEDGER_CONNECT.TITLE_FAILED')}
                textFailed={t(
                  isStacksSelected
                    ? 'LEDGER_CONNECT.STX_SUBTITLE_FAILED'
                    : 'LEDGER_CONNECT.BTC_SUBTITLE_FAILED',
                )}
                imageDefault={isStacksSelected ? LedgerConnectStxSVG : LedgerConnectBtcSVG}
                isConnectSuccess={isConnectSuccess}
                isConnectFailed={isConnectFailed}
              />
            )}
            {currentStepIndex === 2.5 && (
            <CreateAnotherAccountContainer>
              <img src={isBitcoinSelected ? BtcOdrinalsIconSVG : StxIconSVG} alt="" />
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
            {currentStepIndex === 3 && (
              <>
                <AddAddressHeaderContainer>
                  <img src={isBitcoinSelected ? BtcOdrinalsIconSVG : StxIconSVG} alt="" />
                  <SelectAssetTitle>
                    {t(
                      isBitcoinSelected
                        ? 'LEDGER_ADD_ADDRESS.TITLE_BTC'
                        : 'LEDGER_ADD_ADDRESS.TITLE_STX',
                    )}
                  </SelectAssetTitle>
                </AddAddressHeaderContainer>
                <AddAddressDetailsContainer>
                  <SelectAssetText>{t('LEDGER_ADD_ADDRESS.SUBTITLE')}</SelectAssetText>
                  <LedgerAddressComponent
                    title={t('LEDGER_ADD_ADDRESS.BTC')}
                    address={bitcoinCredentials?.address}
                  />
                  <LedgerAddressComponent
                    title={t('LEDGER_ADD_ADDRESS.ORDINALS')}
                    address={ordinalsCredentials?.address}
                  />
                  <LedgerAddressComponent
                    title={t('LEDGER_ADD_ADDRESS.STX')}
                    address={stacksCredentials?.address}
                  />
                </AddAddressDetailsContainer>
                <AlertContainer>
                  <img src={InfoIconSVG} alt="info" />
                  <p>{t('LEDGER_ADD_ADDRESS.ALERT')}</p>
                </AlertContainer>
              </>
            )}
            {currentStepIndex === 4 && (
              <AddressAddedContainer>
                <img src={CheckCircleSVG} alt="Success" />
                <SelectAssetTitle>
                  {t(
                    isStacksSelected
                      ? 'LEDGER_ADDRESS_ADDED.TITLE_STX'
                      : 'LEDGER_ADDRESS_ADDED.TITLE_BTC_ORDINALS',
                  )}
                </SelectAssetTitle>
                <SelectAssetText>{isStacksSelected ? t('LEDGER_ADDRESS_ADDED.SUBTITLE_STX') : t('LEDGER_ADDRESS_ADDED.SUBTITLE')}</SelectAssetText>
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
                  placeholder={`My ledger ${addressIndex + 1}`}
                  id="account_name_input"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </AddAccountNameContainer>
            )}
            {currentStepIndex === 6 && (
              <EndScreenContainer>
                <img src={LedgerImportEndSVG} alt="Wallet created" />
                <EndScreenTextContainer>
                  <SelectAssetTitle>{t('LEDGER_IMPORT_END.TITLE')}</SelectAssetTitle>
                  <SelectAssetText>{t('LEDGER_IMPORT_END.SUBTITLE')}</SelectAssetText>
                </EndScreenTextContainer>
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
            <ActionButton
              disabled={isButtonDisabled}
              processing={isButtonDisabled}
              onPress={handleClickMultipleAccounts}
              text={t('LEDGER_IMPORT_YES_BUTTON')}
            />
            )}
            {currentStepIndex === 3 && (
              <ActionButton
                disabled={isButtonDisabled}
                processing={isButtonDisabled}
                onPress={saveAddressToWallet}
                text={t('LEDGER_IMPORT_ADD_BUTTON')}
              />
            )}
            {currentStepIndex === 4 && (
              <ActionButton onPress={handleClickNext} text={t('LEDGER_IMPORT_NEXT_BUTTON')} />
            )}
            {currentStepIndex === 5 && (
              <ActionButton
                disabled={isButtonDisabled}
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
