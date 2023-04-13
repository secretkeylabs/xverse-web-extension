import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { animated, useTransition } from '@react-spring/web';
import Transport from '@ledgerhq/hw-transport-webusb';
import ActionButton from '@components/button';
import {
  Account,
  importNestedSegwitAccountFromLedger,
  importTaprootAccountFromLedger,
  NetworkType,
} from '@secretkeylabs/xverse-core';
import useWalletReducer from '@hooks/useWalletReducer';
import { ledgerDelay } from '@common/utils/ledger';
import LedgerAssetSelectCard from '@components/ledger/ledgerAssetSelectCard';
import LedgerConnectionView from '../../../components/ledger/connectLedgerView';
import LedgerAddressComponent from '@components/ledger/ledgerAddressComponent';
import useWalletSelector from '@hooks/useWalletSelector';
import LedgerInput from '@components/ledger/ledgerInput';
import { useLocation } from 'react-router-dom';

import LedgerImportStartSVG from '@assets/img/ledger/ledger_import_start.svg';
import BtcIconSVG from '@assets/img/ledger/btc_icon.svg';
import OdrinalsIconSVG from '@assets/img/ledger/ordinals_icon.svg';
import BtcOdrinalsIconSVG from '@assets/img/ledger/btc_ordinals_icon.svg';
import LedgerConnectBtcSVG from '@assets/img/ledger/ledger_import_connect_btc.svg';
import InfoIconSVG from '@assets/img/ledger/info_icon.svg';
import CheckCircleSVG from '@assets/img/ledger/check_circle.svg';
import LedgerImportEndSVG from '@assets/img/ledger/ledger_import_end.svg';
import ArrowLeftIconSVG from '@assets/img/ledger/arrow_left_icon.svg';
import FullScreenHeader from '@components/ledger/fullScreenHeader';

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
  marginBottom: props.theme.spacing(55),
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
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isBitcoinSelected, setIsBitcoinSelected] = useState(true);
  const [isOrdinalsSelected, setIsOrdinalsSelected] = useState(true);
  const [bitcoinCredentials, setBitcoinCredentials] = useState<Credential | undefined>(undefined);
  const [ordinalsCredentials, setOrdinalsCredentials] = useState<Credential | undefined>(undefined);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [isConnectSuccess, setIsConnectSuccess] = useState<boolean>(false);
  const [isConnectFailed, setIsConnectFailed] = useState<boolean>(false);
  const [addressIndex, setAddressIndex] = useState<number>(0);
  const [accountName, setAccountName] = useState<string>('');
  const { t } = useTranslation('translation', { keyPrefix: 'LEDGER_IMPORT_SCREEN' });
  const { search } = useLocation();
  const { addLedgerAccount, updateLedgerAccounts } = useWalletReducer();
  const { ledgerAccountsList, selectedAccount } = useWalletSelector();
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

  const isOrdinalsOnly = useMemo(() => {
    if (!search) return false;
    const params = new URLSearchParams(search);
    const ordinalsOnly = params.get('ordinals-only') === 'true';

    return ordinalsOnly;
  }, [search]);

  useEffect(() => {
    if (isOrdinalsOnly) {
      setIsBitcoinSelected(false);
      setIsOrdinalsSelected(true);
      setCurrentStepIndex(2);
    }
  }, [isOrdinalsOnly]);

  const importAccounts = async () => {
    const transport = await Transport.create();
    const network: NetworkType = 'Testnet';
    const newAddressIndex = isBitcoinSelected
      ? ledgerAccountsList.length
      : ledgerAccountsList.filter((account) => account.ordinalsAddress !== '').length;
    setAddressIndex(newAddressIndex);
    if (isBitcoinSelected) {
      const { address, publicKey } = await importNestedSegwitAccountFromLedger(
        transport,
        network,
        0,
        newAddressIndex,
        false
      );
      setBitcoinCredentials({ address, publicKey });
    }
    if (isOrdinalsSelected) {
      const { address, publicKey } = await importTaprootAccountFromLedger(
        transport,
        network,
        0,
        newAddressIndex,
        false
      );
      setOrdinalsCredentials({ address, publicKey });
    }
    await transport.close();
  };

  const checkDeviceConnection = async () => {
    try {
      setIsConnectFailed(false);
      setIsButtonDisabled(true);
      await importAccounts();
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
    try {
      if (isBitcoinSelected) {
        const ledgerAccount: Account = {
          id: addressIndex,
          stxAddress: '',
          btcAddress: bitcoinCredentials?.address || '',
          ordinalsAddress: ordinalsCredentials?.address || '',
          masterPubKey: '',
          stxPublicKey: '',
          btcPublicKey: bitcoinCredentials?.publicKey || '',
          ordinalsPublicKey: ordinalsCredentials?.publicKey || '',
          isLedgerAccount: true,
          accountName: `Ledger Account ${addressIndex + 1}`,
        };
        await addLedgerAccount(ledgerAccount);
        await ledgerDelay(1000);
        handleClickNext();
        setIsButtonDisabled(false);
        return;
      }

      if (selectedAccount) {
        const newLedgerAccount: Account = {
          ...selectedAccount,
          ordinalsAddress: ordinalsCredentials?.address || '',
          ordinalsPublicKey: ordinalsCredentials?.publicKey || '',
        };
        await updateLedgerAccounts(newLedgerAccount);
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
      const updatedAccount: Account = { ...accountToUpdate, accountName: accountName };
      await updateLedgerAccounts(updatedAccount);
      await ledgerDelay(1000);
      setIsButtonDisabled(false);
      handleClickNext();
    } catch (err) {
      console.log(err);
      setIsButtonDisabled(false);
    }
  };

  const handleWindowClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  const handleClickNext = () => {
    setCurrentStepIndex(currentStepIndex + 1);
  };

  const handleSkipToEnd = () => {
    setCurrentStepIndex(6);
  };

  const backToAssetSelection = () => {
    setIsBitcoinSelected(true);
    setIsOrdinalsSelected(true);
    setBitcoinCredentials(undefined);
    setOrdinalsCredentials(undefined);
    setIsButtonDisabled(false);
    setIsConnectSuccess(false);
    setIsConnectFailed(false);
    setAddressIndex(0);
    setAccountName('');

    setCurrentStepIndex(1);
  };

  return (
    <Container>
      <FullScreenHeader />
      {currentStepIndex > 1 && !isOrdinalsOnly && (
        <AssetSelectionButton onClick={backToAssetSelection}>
          <img src={ArrowLeftIconSVG} />
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
                    icon={BtcIconSVG}
                    title={t('LEDGER_IMPORT_2_SELECT.BTC_TITLE')}
                    text={t('LEDGER_IMPORT_2_SELECT.BTC_SUBTITLE')}
                    id={'btc_select_card'}
                    isChecked={true}
                    onChange={() => {}}
                  />
                  <LedgerAssetSelectCard
                    icon={OdrinalsIconSVG}
                    title={t('LEDGER_IMPORT_2_SELECT.ORDINALS_TITLE')}
                    text={t('LEDGER_IMPORT_2_SELECT.ORDINALS_SUBTITLE')}
                    id={'ordinals_select_card'}
                    isChecked={isOrdinalsSelected}
                    onChange={(e) => setIsOrdinalsSelected(e.target.checked)}
                  />
                  <SelectAssetFootNote>{t('LEDGER_IMPORT_2_FOOTNOTE')}</SelectAssetFootNote>
                </ImportCardContainer>
              </div>
            )}
            {currentStepIndex === 2 && (
              <LedgerConnectionView
                title={t('LEDGER_CONNECT.TITLE')}
                text={t('LEDGER_CONNECT.SUBTITLE')}
                titleFailed={t('LEDGER_CONNECT.TITLE_FAILED')}
                textFailed={t('LEDGER_CONNECT.SUBTITLE_FAILED')}
                imageDefault={LedgerConnectBtcSVG}
                isConnectSuccess={isConnectSuccess}
                isConnectFailed={isConnectFailed}
              />
            )}
            {currentStepIndex === 3 && (
              <>
                <AddAddressHeaderContainer>
                  <img
                    src={
                      isBitcoinSelected
                        ? isOrdinalsSelected
                          ? BtcOdrinalsIconSVG
                          : BtcIconSVG
                        : OdrinalsIconSVG
                    }
                  />
                  <SelectAssetTitle>
                    {t(
                      isBitcoinSelected
                        ? 'LEDGER_ADD_ADDRESS.TITLE_BTC'
                        : 'LEDGER_ADD_ADDRESS.TITLE_ORDINALS'
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
                    isBitcoinSelected && isOrdinalsSelected
                      ? 'LEDGER_ADDRESS_ADDED.TITLE_BTC_ORDINALS'
                      : isOrdinalsSelected
                      ? 'LEDGER_ADDRESS_ADDED.TITLE_ORDINALS'
                      : 'LEDGER_ADDRESS_ADDED.TITLE_BTC'
                  )}
                </SelectAssetTitle>
                <SelectAssetText>{t('LEDGER_ADDRESS_ADDED.SUBTITLE')}</SelectAssetText>
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
                  id={'account_name_input'}
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
              <ActionButton onPress={handleClickNext} text={t('LEDGER_IMPORT_CONTINUE_BUTTON')} />
            )}
            {currentStepIndex === 2 && (
              <ActionButton
                processing={isButtonDisabled}
                disabled={isButtonDisabled}
                onPress={checkDeviceConnection}
                text={t(
                  isConnectFailed
                    ? 'LEDGER_IMPORT_TRY_AGAIN_BUTTON'
                    : 'LEDGER_IMPORT_CONNECT_BUTTON'
                )}
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
              <ActionButton
                onPress={isOrdinalsOnly ? handleSkipToEnd : handleClickNext}
                text={t('LEDGER_IMPORT_NEXT_BUTTON')}
              />
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
