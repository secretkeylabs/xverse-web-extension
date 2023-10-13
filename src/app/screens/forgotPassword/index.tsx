import BackHeader from '@components/backHeader';
import CheckBox from '@components/checkBox';
import useWalletReducer from '@hooks/useWalletReducer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: props.theme.colors.elevation0,
  padding: `0 ${props.theme.spacing(8)}px 0 ${props.theme.spacing(8)}px`,
}));

const Paragraph = styled.p((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  marginTop: props.theme.spacing(12),
}));

const BottomContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(78),
}));

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(16),
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ResetButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.feedback.error,
  color: props.theme.colors.white_0,
  width: '48%',
  height: 44,
  '&:disabled': {
    opacity: 0.6,
  },
}));

const CancelButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.elevation0,
  border: `1px solid ${props.theme.colors.elevation2}`,
  color: props.theme.colors.white_0,
  width: '48%',
  height: 44,
}));

function ForgotPassword(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'FORGOT_PASSWORD_SCREEN' });
  const [hasBackedUp, setHasBackedUp] = useState<boolean>(false);
  const navigate = useNavigate();
  const { resetWallet } = useWalletReducer();

  const onBack = () => {
    navigate('/');
  };

  const handleToggleBackUp = () => {
    setHasBackedUp(!hasBackedUp);
  };

  const handleResetWallet = () => {
    resetWallet();
    navigate('/');
  };

  return (
    <Container>
      <BackHeader headerText={t('TITLE')} onPressBack={onBack} />
      <Paragraph>{t('PARAGRAPH1')}</Paragraph>
      <Paragraph>{t('PARAGRAPH2')}</Paragraph>
      <BottomContainer>
        <CheckBox
          checkBoxLabel={t('BACKUP_CHECKBOX_LABEL')}
          isChecked={hasBackedUp}
          checkBoxId="backup"
          onCheck={handleToggleBackUp}
        />
        <ButtonsContainer>
          <CancelButton onClick={onBack}>Cancel</CancelButton>
          <ResetButton disabled={!hasBackedUp} onClick={handleResetWallet}>
            Reset
          </ResetButton>
        </ButtonsContainer>
      </BottomContainer>
    </Container>
  );
}

export default ForgotPassword;
