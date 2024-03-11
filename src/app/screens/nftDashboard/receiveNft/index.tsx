import Cross from '@assets/img/dashboard/X.svg';
import plusIcon from '@assets/img/dashboard/plus.svg';
import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import ordinalsIcon from '@assets/img/nftDashboard/ordinals_icon.svg';
import ActionButton from '@components/button';
import UpdatedBottomModal from '@components/updatedBottomModal';
import useWalletSelector from '@hooks/useWalletSelector';
import { Plus } from '@phosphor-icons/react';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ReceiveCardComponent from '../../../components/receiveCardComponent';

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.xl,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  gap: props.theme.space.m,
}));

const Icon = styled.img({
  width: 24,
  height: 24,
  position: 'absolute',
  zIndex: 2,
  left: 0,
  top: 0,
});

const IconContainer = styled.div((props) => ({
  position: 'relative',
  marginBottom: props.theme.spacing(12),
}));

const IconBackground = styled.div((props) => ({
  width: 24,
  height: 24,
  position: 'absolute',
  zIndex: 1,
  left: 20,
  top: 0,
  backgroundColor: props.theme.colors.white_900,
  borderRadius: 30,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
  margin: props.theme.spacing(12),
  marginBottom: props.theme.spacing(10),
}));

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  flex: 1,
}));

const VerifyOrViewContainer = styled.div((props) => ({
  margin: props.theme.spacing(8),
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(20),
}));

const VerifyButtonContainer = styled.div((props) => ({
  minWidth: 300,
  marginBottom: props.theme.spacing(6),
}));

interface Props {
  visible: boolean;
  onClose: () => void;
  setOrdinalReceiveAlert: () => void;
  isGalleryOpen: boolean;
}

function ReceiveNftModal({ visible, onClose, isGalleryOpen, setOrdinalReceiveAlert }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const { stxAddress, ordinalsAddress, showOrdinalReceiveAlert, selectedAccount } =
    useWalletSelector();
  const [isReceivingAddressesVisible, setIsReceivingAddressesVisible] = useState(
    !isLedgerAccount(selectedAccount),
  );
  const [choseToVerifyAddresses, setChoseToVerifyAddresses] = useState(false);

  const onReceivePress = () => {
    navigate('/receive/STX');
  };

  const onOrdinalsReceivePress = () => {
    navigate('/receive/ORD');
  };

  const onOrdinalReceiveAlertOpen = () => {
    if (showOrdinalReceiveAlert) setOrdinalReceiveAlert();
  };

  const handleReceiveModalClose = () => {
    if (isLedgerAccount(selectedAccount)) {
      setIsReceivingAddressesVisible(false);
    }

    if (choseToVerifyAddresses) {
      setChoseToVerifyAddresses(false);
    }

    onClose();
  };

  const handleReceiveModalOpen = () => {
    setIsReceivingAddressesVisible(true);
  };

  const handleVerifyAddresses = () => {
    setChoseToVerifyAddresses(true);
    handleReceiveModalOpen();
  };

  const receiveContent = (
    <ColumnContainer>
      {ordinalsAddress && (
        <ReceiveCardComponent
          title={t('ORDINALS')}
          address={ordinalsAddress}
          onQrAddressClick={onOrdinalsReceivePress}
          showVerifyButton={choseToVerifyAddresses}
          currency="ORD"
        >
          <IconContainer>
            <Icon src={ordinalsIcon} />
            <IconBackground>
              <Plus weight="bold" size={12} />
            </IconBackground>
          </IconContainer>
        </ReceiveCardComponent>
      )}

      {stxAddress && (
        <ReceiveCardComponent
          title={t('STACKS_NFT')}
          address={stxAddress}
          onQrAddressClick={onReceivePress}
          showVerifyButton={choseToVerifyAddresses}
          currency="STX"
        >
          <IconContainer>
            <Icon src={stacksIcon} />
            <IconBackground>
              <Plus weight="bold" size={12} />
            </IconBackground>
          </IconContainer>
        </ReceiveCardComponent>
      )}

      {isLedgerAccount(selectedAccount) && !stxAddress && (
        <ActionButton
          transparent
          src={plusIcon}
          text={t('ADD_STACKS_ADDRESS')}
          onPress={async () => {
            if (!isInOptions()) {
              await chrome.tabs.create({
                url: chrome.runtime.getURL(`options.html#/add-stx-address-ledger`),
              });
            } else {
              navigate('/add-stx-address-ledger');
            }
          }}
        />
      )}
    </ColumnContainer>
  );

  const verifyOrViewAddresses = (
    <VerifyOrViewContainer>
      <VerifyButtonContainer>
        <ActionButton
          text={t('VERIFY_ADDRESS_ON_LEDGER')}
          onPress={
            !stxAddress
              ? async () => {
                  await chrome.tabs.create({
                    url: chrome.runtime.getURL(`options.html#/verify-ledger?currency=ORD`),
                  });
                }
              : handleVerifyAddresses
          }
        />
      </VerifyButtonContainer>
      <ActionButton transparent text={t('VIEW_ADDRESS')} onPress={handleReceiveModalOpen} />
    </VerifyOrViewContainer>
  );

  return isGalleryOpen ? (
    <>
      <RowContainer>
        <Text>{t('RECEIVE_NFT')}</Text>
        <ButtonImage onClick={handleReceiveModalClose}>
          <img src={Cross} alt="cross" />
        </ButtonImage>
      </RowContainer>
      {isReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
    </>
  ) : (
    <UpdatedBottomModal
      visible={visible}
      header={t('RECEIVE_NFT')}
      onClose={handleReceiveModalClose}
    >
      {isReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
    </UpdatedBottomModal>
  );
}

export default ReceiveNftModal;
