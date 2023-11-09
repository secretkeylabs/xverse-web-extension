import ActionButton from '@components/button';
import CheckBox from '@components/checkBox';
import TopRow from '@components/topRow';
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
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: props.theme.spacing(16),
  columnGap: props.theme.spacing(8),
}));

const StyledTopRow = styled(TopRow)({
  marginLeft: 0,
});

function ForgotPassword(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'FORGOT_PASSWORD_SCREEN' });
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const navigate = useNavigate();
  const { resetWallet } = useWalletReducer();

  const onBack = () => {
    navigate('/');
  };

  const handleToggleBackUp = () => {
    setHasBackedUp(!hasBackedUp);
  };

  const handleResetWallet = async () => {
    await resetWallet();
    navigate('/');
  };

  return (
    <Container>
      <StyledTopRow title={t('TITLE')} onClick={onBack} />
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
          <ActionButton text={t('CANCEL')} onPress={onBack} transparent />
          <ActionButton
            text={t('RESET')}
            disabled={!hasBackedUp}
            onPress={handleResetWallet}
            warning
          />
        </ButtonsContainer>
      </BottomContainer>
    </Container>
  );
}

export default ForgotPassword;
