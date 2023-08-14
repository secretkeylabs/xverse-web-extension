import BottomModal from '@components/bottomModal';
import { useTranslation } from 'react-i18next';
import Cross from '@assets/img/dashboard/X.svg';
import styled from 'styled-components';
import ordinalsIcon from '@assets/img/nftDashboard/ordinals_icon.svg';
import stacksIcon from '@assets/img/nftDashboard/stacks_icon.svg';
import plusIcon from '@assets/img/dashboard/plus.svg';
import { useNavigate } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import ActionButton from '@components/button';
import { useState } from 'react';
import { isLedgerAccount } from '@utils/helper';
import ReceiveCardComponent from '../../../components/receiveCardComponent';

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(16),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const Icon = styled.img({
  width: 24,
  height: 24,
});

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

const AddStxButtonContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(6),
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

    onClose();
  };

  const handleReceiveModalOpen = () => {
    setIsReceivingAddressesVisible(true);
  };

  const receiveContent = (
    <ColumnContainer>
      {ordinalsAddress && (
        <ReceiveCardComponent
          title={t('ORDINALS')}
          address={ordinalsAddress}
          onQrAddressClick={onOrdinalsReceivePress}
        >
          <Icon src={ordinalsIcon} />
        </ReceiveCardComponent>
      )}

      {stxAddress && (
        <ReceiveCardComponent
          title={t('STACKS_NFT')}
          address={stxAddress}
          onQrAddressClick={onReceivePress}
        >
          <Icon src={stacksIcon} />
        </ReceiveCardComponent>
      )}

      {isLedgerAccount(selectedAccount) && !stxAddress && (
        <AddStxButtonContainer>
          <ActionButton
            transparent
            src={plusIcon}
            text={t('ADD_STACKS_ADDRESS')}
            onPress={async () => {
              await chrome.tabs.create({
                url: chrome.runtime.getURL(`options.html#/add-stx-address-ledger`),
              });
            }}
          />
        </AddStxButtonContainer>
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
              : handleReceiveModalOpen
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
    <BottomModal visible={visible} header={t('RECEIVE_NFT')} onClose={handleReceiveModalClose}>
      {isReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
    </BottomModal>
  );
}

export default ReceiveNftModal;
