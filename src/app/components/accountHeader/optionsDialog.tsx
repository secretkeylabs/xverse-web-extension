import { lockWalletAction } from '@stores/wallet/actions/actionCreators';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: 30,
  right: 20,
  paddingTop: props.theme.spacing(12.5),
  paddingBottom: props.theme.spacing(1),
  borderRadius: 12,
  width: 179,
  background: props.theme.colors.background.elevation2,
}));

const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  justify-content: flex-start;
  margin-left: 24px;
  margin-right: 24px;
  margin-bottom: 24px;
  font: ${(props) => props.theme.body_medium_m};
  color: ${(props) => props.theme.colors.white['0']};
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 0.6;
  }
`;

const WarningButton = styled(ButtonRow)`
  color: ${(props) => props.theme.colors.feedback.error};
`;

const OuterContainer = styled.div({
  width: '100%',
  height: '100%',
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
  const dispatch = useDispatch();

  const handleAccountSelect = () => {
    navigate('/account-list');
  };

  const onLockPress = () => {
    dispatch(lockWalletAction());
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
