import PasswordInput from '@components/passwordInput';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useVault from '@hooks/useVault';
import useWalletReducer from '@hooks/useWalletReducer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: `0 ${props.theme.space.s}`,
  paddingTop: props.theme.space.xxl,
  paddingBottom: props.theme.space.xs,
}));

function ResetWalletScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SETTING_SCREEN' });
  const vault = useVault();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { resetWallet } = useWalletReducer();

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handlePasswordNextClick = async () => {
    try {
      setLoading(true);
      await vault.unlockVault(password);
      setPassword('');
      setError('');
      await resetWallet();
      navigate(-1);
    } catch (e) {
      setError(t('INCORRECT_PASSWORD_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <PasswordInput
          title={t('ENTER_PASSWORD')}
          inputLabel={t('PASSWORD')}
          enteredPassword={password}
          setEnteredPassword={setPassword}
          handleContinue={handlePasswordNextClick}
          handleBack={handleBackButtonClick}
          passwordError={error}
          stackButtonAlignment
          loading={loading}
          autoFocus
        />
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default ResetWalletScreen;
