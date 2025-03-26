import PasswordInput from '@components/passwordInput';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useVault from '@hooks/useVault';
import { useState } from 'react';
import toast from 'react-hot-toast';
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

function ChangePasswordScreen() {
  const { t } = useTranslation('translation');
  const vault = useVault();
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handleConfirmCurrentPasswordNextClick = async () => {
    try {
      setLoading(true);
      await vault.unlockVault(oldPassword);
      setPassword('');
      setError('');
      setCurrentStepIndex(1);
    } catch (e) {
      setError(t('CREATE_PASSWORD_SCREEN.INCORRECT_PASSWORD_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  const handleEnterNewPasswordNextClick = () => {
    setCurrentStepIndex(2);
  };

  const handleConfirmNewPasswordNextClick = async () => {
    if (confirmPassword === password) {
      setError('');
      await vault.changePassword(oldPassword, confirmPassword);
      toast.success(t('SETTING_SCREEN.UPDATE_PASSWORD_SUCCESS'));
      navigate('/settings');
    } else {
      setError(t('CREATE_PASSWORD_SCREEN.CONFIRM_PASSWORD_MATCH_ERROR'));
    }
  };

  const handleConfirmNewPasswordBackClick = () => {
    setCurrentStepIndex(1);
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        {currentStepIndex === 0 && (
          <PasswordInput
            title={t('CREATE_PASSWORD_SCREEN.ENTER_PASSWORD')}
            inputLabel={t('LOGIN_SCREEN.PASSWORD_INPUT_LABEL')}
            enteredPassword={oldPassword}
            setEnteredPassword={setOldPassword}
            handleContinue={handleConfirmCurrentPasswordNextClick}
            handleBack={handleBackButtonClick}
            passwordError={error}
            stackButtonAlignment
            loading={loading}
            autoFocus
          />
        )}
        {currentStepIndex === 1 && (
          <PasswordInput
            title={t('SETTING_SCREEN.ENTER_YOUR_NEW_PASSWORD')}
            inputLabel={t('SETTING_SCREEN.TEXT_INPUT_NEW_PASSWORD_LABEL')}
            enteredPassword={password}
            setEnteredPassword={setPassword}
            handleContinue={handleEnterNewPasswordNextClick}
            handleBack={handleBackButtonClick}
            checkPasswordStrength
            stackButtonAlignment
            autoFocus
          />
        )}
        {currentStepIndex === 2 && (
          <PasswordInput
            title={t('SETTING_SCREEN.CONFIRM_YOUR_NEW_PASSWORD')}
            inputLabel={t('SETTING_SCREEN.TEXT_INPUT_NEW_PASSWORD_LABEL')}
            submitButtonText={t('COMMON.CONFIRM')}
            enteredPassword={confirmPassword}
            setEnteredPassword={setConfirmPassword}
            handleContinue={handleConfirmNewPasswordNextClick}
            handleBack={handleConfirmNewPasswordBackClick}
            passwordError={error}
            stackButtonAlignment
            autoFocus
          />
        )}
      </Container>
      <BottomBar tab="settings" />
    </>
  );
}

export default ChangePasswordScreen;
