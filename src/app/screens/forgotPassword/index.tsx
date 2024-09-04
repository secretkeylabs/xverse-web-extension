import TopRow from '@components/topRow';
import useWalletReducer from '@hooks/useWalletReducer';
import Button from '@ui-library/button';
import Checkbox from '@ui-library/checkbox';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: props.theme.colors.elevation0,
  padding: `0 ${props.theme.space.m}`,
}));

const Paragraph = styled.p((props) => ({
  ...props.theme.typography.body_l,
  color: props.theme.colors.white_200,
  textAlign: 'left',
  marginTop: props.theme.space.l,
}));

const BottomContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(78),
}));

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: props.theme.space.xl,
  columnGap: props.theme.space.xs,
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
    onBack();
  };

  return (
    <Container>
      <StyledTopRow title={t('TITLE')} onClick={onBack} />
      <Paragraph>{t('PARAGRAPH1')}</Paragraph>
      <Paragraph>{t('PARAGRAPH2')}</Paragraph>
      <BottomContainer>
        <Checkbox
          checkboxId="backed-up-seedphrase-checkbox"
          text={t('BACKUP_CHECKBOX_LABEL')}
          checked={hasBackedUp}
          onChange={handleToggleBackUp}
        />
        <ButtonsContainer>
          <Button title={t('CANCEL')} onClick={onBack} variant="secondary" />
          <Button
            title={t('RESET')}
            disabled={!hasBackedUp}
            onClick={handleResetWallet}
            variant="danger"
          />
        </ButtonsContainer>
      </BottomContainer>
    </Container>
  );
}

export default ForgotPassword;
