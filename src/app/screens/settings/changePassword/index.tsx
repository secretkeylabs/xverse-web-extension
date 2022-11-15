import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import styled, { useTheme } from 'styled-components';
import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import { useTranslation } from 'react-i18next';
import { encryptSeedPhrase } from '@utils/encryptionUtils';
import useWalletSelector from '@hooks/useWalletSelector';
import { storeEncryptedSeedAction } from '@stores/wallet/actions/actionCreators';
import { useDispatch } from 'react-redux';
import PasswordInput from '@components/passwordInput';
import useWalletReducer from '@hooks/useWalletReducer';

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

function ChangePasswordScreen() {
  const { t } = useTranslation('translation');

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const { seedPhrase } = useWalletSelector();
  const { unlockWallet } = useWalletReducer();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const options = {
    position: 'bottom-right',
    style: {
      background: theme.colors.feedback.success,
      borderRadius: theme.radius(2),
      boxShadow: '0px 7px 16px -4px rgba(25, 25, 48, 0.25)',
      color: theme.colors.background.elevation0,
      fontStyle: theme.body_medium_m,
      textAlign: 'center',
    },
    closeStyle: {
      color: theme.colors.background.elevation0,
      fontSize: '16px',
    },
  };

  const [openSnackbar] = useSnackbar(options);
  const handleBackButtonClick = () => {
    navigate('/settings');
  };

  const handleConfirmCurrentPasswordNextClick = async () => {
    try {
      await unlockWallet(password);
      setPassword('');
      setError('');
      setCurrentStepIndex(1);
    } catch (e) {
      setError(t('CREATE_PASSWORD_SCREEN.INCORRECT_PASSWORD_ERROR'));
    }
  };

  const handleEnterNewPasswordNextClick = () => {
    setCurrentStepIndex(2);
  };

  const handleConfirmNewPasswordNextClick = async () => {
    if (confirmPassword === password) {
      setError('');
      const encryptedSeed = await encryptSeedPhrase(seedPhrase, password);
      dispatch(storeEncryptedSeedAction(encryptedSeed));
      openSnackbar(
        t('SETTING_SCREEN.UPDATE_PASSWORD_SUCCESS'),
        10000,
      );
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
          enteredPassword={password}
          setEnteredPassword={setPassword}
          handleContinue={handleConfirmCurrentPasswordNextClick}
          handleBack={handleBackButtonClick}
          passwordError={error}
          stackButtonAlignment
        />
        )}
        {currentStepIndex === 1 && (
        <PasswordInput
          title={t('CREATE_PASSWORD_SCREEN.CREATE_PASSWORD_TITLE')}
          inputLabel={t('CREATE_PASSWORD_SCREEN.TEXT_INPUT_NEW_PASSWORD_LABEL')}
          enteredPassword={password}
          setEnteredPassword={setPassword}
          handleContinue={handleEnterNewPasswordNextClick}
          handleBack={handleBackButtonClick}
          checkPasswordStrength
          stackButtonAlignment
        />
        )}
        {currentStepIndex === 2 && (
        <PasswordInput
          title={t('CREATE_PASSWORD_SCREEN.CONFIRM_PASSWORD_TITLE')}
          inputLabel={t('CREATE_PASSWORD_SCREEN.TEXT_INPUT_CONFIRM_PASSWORD_LABEL')}
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
