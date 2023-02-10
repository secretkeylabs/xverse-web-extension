import BottomModal from '@components/bottomModal';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import OrdinalsIcon from '@assets/img/nftDashboard/oridinals_icon.svg';
import StacksIcon from '@assets/img/nftDashboard/stacks_icon.svg';
import { useNavigate } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import ReceiveCardComponent from './receiveCardComponent';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(16),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

function ReceiveNftModal({ visible, onClose }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const {
    stxAddress,
    btcAddress,
  } = useWalletSelector();
  const onReceivePress = () => {
    navigate('/receive/STX');
  };

  const onOrdinalsReceivePress = () => {
    navigate('/receive/BTC');
  };

  return (
    <BottomModal visible={visible} header={t('RECEIVE_NFT')} onClose={onClose}>
      <ColumnContainer>
        <ReceiveCardComponent
          icon={StacksIcon}
          title={t('STACKS_NFT')}
          address={stxAddress}
          onQrAddressClick={onReceivePress}
        />
        <ReceiveCardComponent
          icon={OrdinalsIcon}
          title={t('ORDINALS')}
          address={btcAddress}
          onQrAddressClick={onOrdinalsReceivePress}
        />
      </ColumnContainer>
    </BottomModal>
  );
}

export default ReceiveNftModal;
