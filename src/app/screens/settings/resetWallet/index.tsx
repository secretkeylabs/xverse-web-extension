import PasswordInput from '@components/passwordInput';
import useWalletReducer from '@hooks/useWalletReducer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(30),
  marginLeft: props.theme.spacing(13),
  marginRight: props.theme.spacing(13),

}));

function ResetWalletScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'RESET_WALLET_SCREEN' });
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { unlockWallet, resetWallet } = useWalletReducer();

  const goToSettingScreen = () => {
    navigate('/settings');
  };

  const handleResetWallet = () => {
    resetWallet();
    navigate('/');
  };

  const handlePasswordNextClick = async () => {
    try {
      await unlockWallet(password);
      setPassword('');
      setError('');
      handleResetWallet();
    } catch (e) {
      setError(t('INCORRECT_PASSWORD_ERROR'));
    }
  };

  return (
    <Container>
      <PasswordInput
        title={t('ENTER_PASSWORD')}
        inputLabel={t('PASSWORD')}
        enteredPassword={password}
        setEnteredPassword={setPassword}
        handleContinue={handlePasswordNextClick}
        handleBack={goToSettingScreen}
        passwordError={error}
        stackButtonAlignment
      />
    </Container>
  );
}

export default ResetWalletScreen;
