import BottomModal from '@components/bottomModal';
import { useTranslation } from 'react-i18next';
import Cross from '@assets/img/dashboard/X.svg';
import styled from 'styled-components';
import OrdinalsIcon from '@assets/img/nftDashboard/ordinals_icon.svg';
import StacksIcon from '@assets/img/nftDashboard/stacks_icon.svg';
import { useNavigate } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import ActionButton from '@components/button';
import { useState } from 'react';
import { isLedgerAccount } from '@utils/helper';
import ReceiveCardComponent from '../../../components/receiveCardComponent';

interface Props {
  visible: boolean;
  onClose: () => void;
  setOrdinalReceiveAlert: () => void;
  isGalleryOpen: boolean;
}

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

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
  margin: '24px 24px 20px 24px',
});

const ButtonImage = styled.button({
  backgroundColor: 'transparent',
});

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  flex: 1,
}));

const VerifyOrViewContainer = styled.div(props => ({
  margin: props.theme.spacing(8),
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(20),
}));

const VerifyButtonContainer = styled.div(props => ({
  marginBottom: props.theme.spacing(6),
}));

function ReceiveNftModal({ visible, onClose, isGalleryOpen, setOrdinalReceiveAlert }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const { stxAddress, ordinalsAddress, showOrdinalReceiveAlert, selectedAccount } = useWalletSelector();
  const [isReceivingAddressesVisible, setIsReceivingAddressesVisible] = useState(!isLedgerAccount(selectedAccount));

  const onReceivePress = () => {
    navigate('/receive/STX');
  };

  const onOrdinalsReceivePress = () => {
    navigate('/receive/ORD');
  };

  const onOrdinalReceiveAlertOpen = () => {
    if (showOrdinalReceiveAlert)
    setOrdinalReceiveAlert();
  };

  const onReceiveModalClose = () => {
    if (isLedgerAccount(selectedAccount)) {
      setIsReceivingAddressesVisible(false);
    }

    onClose();
  };

  const receiveContent = (
    <ColumnContainer>
      {ordinalsAddress && (
        <ReceiveCardComponent
          title={t('ORDINALS')}
          address={ordinalsAddress}
          onQrAddressClick={onOrdinalsReceivePress}
        >
          <Icon src={OrdinalsIcon} />
        </ReceiveCardComponent>
      )}
      {stxAddress && (
        <ReceiveCardComponent
          title={t('STACKS_NFT')}
          address={stxAddress}
          onQrAddressClick={onReceivePress}
        >
          <Icon src={StacksIcon} />
        </ReceiveCardComponent>
      )}
    </ColumnContainer>
  );

  const verifyOrViewAddresses = (
    <VerifyOrViewContainer>
      <VerifyButtonContainer>
        <ActionButton text="Verify address on Ledger" onPress={async () => {
          await chrome.tabs.create({
            url: chrome.runtime.getURL(`options.html#/verify-ledger?currency=ORD`),
          });
        }} />
      </VerifyButtonContainer>
      <ActionButton transparent text="View address" onPress={() => {
        setIsReceivingAddressesVisible(true);
      }} />
    </VerifyOrViewContainer>
  );

  return isGalleryOpen ? (
    <>
      <RowContainer>
        <Text>{t('RECEIVE_NFT')}</Text>
        <ButtonImage onClick={onReceiveModalClose}>
          <img src={Cross} alt="cross" />
        </ButtonImage>
      </RowContainer>
      {isReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
    </>
  ) : (
    <BottomModal visible={visible} header={t('RECEIVE_NFT')} onClose={onReceiveModalClose}>
      {isReceivingAddressesVisible ? receiveContent : verifyOrViewAddresses}
    </BottomModal>
  );
}

export default ReceiveNftModal;
