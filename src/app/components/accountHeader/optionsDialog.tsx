import useWalletReducer from '@hooks/useWalletReducer';
import { lockWalletAction } from '@stores/wallet/actions/actionCreators';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: 30,
  right: 20,
  borderRadius: 12,
  paddingTop: 11,
  paddingBottom: 11,
  width: 179,
  background: props.theme.colors.background.elevation2,
}));

const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  justify-content: flex-start;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 11px;
  padding-bottom: 11px;
  font: ${(props) => props.theme.body_medium_m};
  color: ${(props) => props.theme.colors.white['0']};
  :hover {
    background: ${(props) => props.theme.colors.background.elevation3};
  }
  :active {
    background: #3A3D5E;
  }
`;

const WarningButton = styled(ButtonRow)`
  color: ${(props) => props.theme.colors.feedback.error};
`;

const OuterContainer = styled.div({
  height: 600,
  width: 360,
  margin: 'auto',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  backgroundColor: 'transparent',
});

interface Props {
  closeDialog: () => void;
  showResetWalletPrompt: () => void;
}

function OptionsDialog({ closeDialog, showResetWalletPrompt }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'OPTIONS_DIALOG' });
  const navigate = useNavigate();
  const {
    lockWallet,
  } = useWalletReducer();

  const handleAccountSelect = () => {
    navigate('/account-list');
  };

  const onLockPress = () => {
    lockWallet();
  };

  return (
    <OuterContainer onClick={closeDialog}>
      <Container>
        <ButtonRow onClick={handleAccountSelect}>{t('SWITCH_ACCOUNT')}</ButtonRow>
        <ButtonRow onClick={onLockPress}>{t('LOCK')}</ButtonRow>
        <WarningButton onClick={showResetWalletPrompt}>{t('RESET_WALLET')}</WarningButton>
      </Container>
    </OuterContainer>
  );
}

export default OptionsDialog;
