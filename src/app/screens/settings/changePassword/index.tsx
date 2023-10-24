import Check from '@assets/img/settings/check_circle.svg';
import PasswordInput from '@components/passwordInput';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useSeedVault from '@hooks/useSeedVault';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(20),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const ToastContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.feedback.success,
  borderRadius: 12,
  boxShadow: '0px 7px 16px -4px rgba(25, 25, 48, 0.25)',
  height: 44,
  padding: '12px 20px 12px 16px',
  width: 306,
  flex: 1,
}));

const ToastMessage = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.elevation0,
  marginLeft: props.theme.spacing(7),
}));

const ToastDismissButton = styled.button((props) => ({
  background: 'transparent',
  marginLeft: props.theme.spacing(12),
}));

function ChangePasswordScreen() {
  const { t } = useTranslation('translation');
  const { unlockVault, changePassword } = useSeedVault();
  const [password, setPassword] = useState<string>('');
  const [oldPassword, setOldPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  const dismissToast = () => {
    toast.dismiss();
  };

  const handleConfirmCurrentPasswordNextClick = async () => {
    try {
      setLoading(true);
      await unlockVault(oldPassword);
      setPassword('');
      setError('');
      setCurrentStepIndex(1);
    } catch (e) {
      setError(t('CREATE_PASSWORD_SCREEN.INCORRECT_PASSWORD_ERROR'));
    } finally {
      setLoading(false);
    }
  };

  const ToastContent = (
    <ToastContainer>
      <img src={Check} alt="Check" />
      <ToastMessage>{t('SETTING_SCREEN.UPDATE_PASSWORD_SUCCESS')}</ToastMessage>
      <ToastDismissButton onClick={dismissToast}>{t('OK')}</ToastDismissButton>
    </ToastContainer>
  );

  const handleEnterNewPasswordNextClick = () => {
    setCurrentStepIndex(2);
  };

  const handleConfirmNewPasswordNextClick = async () => {
    if (confirmPassword === password) {
      setError('');
      await changePassword(oldPassword, confirmPassword);
      toast.custom(ToastContent);
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
      <TopRow title={t('SETTING_SCREEN.UPDATE_PASSWORD')} onClick={handleBackButtonClick} />
      <PasswordContainer>
        {currentStepIndex === 0 && (
          <PasswordInput
            title={t('CREATE_PASSWORD_SCREEN.ENTER_PASSWORD')}
            inputLabel={t('CREATE_PASSWORD_SCREEN.TEXT_INPUT_ENTER_PASSWORD_LABEL')}
            enteredPassword={oldPassword}
            setEnteredPassword={setOldPassword}
            handleContinue={handleConfirmCurrentPasswordNextClick}
            handleBack={handleBackButtonClick}
            passwordError={error}
            stackButtonAlignment
            loading={loading}
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
            createPasswordFlow
          />
        )}
        {currentStepIndex === 2 && (
          <PasswordInput
            title={t('SETTING_SCREEN.CONFIRM_YOUR_NEW_PASSWORD')}
            inputLabel={t('SETTING_SCREEN.TEXT_INPUT_NEW_PASSWORD_LABEL')}
            enteredPassword={confirmPassword}
            setEnteredPassword={setConfirmPassword}
            handleContinue={handleConfirmNewPasswordNextClick}
            handleBack={handleConfirmNewPasswordBackClick}
            passwordError={error}
            stackButtonAlignment
          />
        )}
      </PasswordContainer>
      <BottomBar tab="settings" />
    </>
  );
}

export default ChangePasswordScreen;
