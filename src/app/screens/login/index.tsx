import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import logo from '@assets/img/xverse_logo.svg';
import useAsyncFn from '@hooks/useAsyncFn';
import useVault from '@hooks/useVault';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSession from '@hooks/useWalletSession';
import { useSpring } from '@react-spring/web';
import Button from '@ui-library/button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AppVersion,
  ButtonContainer,
  ContentContainer,
  ErrorMessage,
  ForgotPasswordButton,
  IconButton,
  LandingTitle,
  Logo,
  PasswordInput,
  PasswordInputContainer,
  PasswordInputLabel,
  ScreenContainer,
  TopSectionContainer,
} from './index.styled';

function Login(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'LOGIN_SCREEN' });
  const navigate = useNavigate();
  const { unlockWallet } = useWalletReducer();
  const vault = useVault();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { setSessionStartTime } = useWalletSession();

  const styles = useSpring({
    from: {
      opacity: 0,
      y: 24,
    },
    to: {
      y: 0,
      opacity: 1,
    },
    delay: 100,
  });

  useAsyncFn(async () => {
    const isInitialised = await vault.isInitialised();
    if (!isInitialised) {
      navigate('/landing');
    }
  }, [vault, navigate]);

  const handleTogglePasswordView = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handlePasswordChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (error) {
      setError('');
    }
    setPassword(event.currentTarget.value);
  };

  const handleVerifyPassword = async () => {
    setIsVerifying(true);
    try {
      await setSessionStartTime();
      await unlockWallet(password);
      setIsVerifying(false);
      navigate(-1);
    } catch (err) {
      setIsVerifying(false);
      setError(t('VERIFY_PASSWORD_ERROR'));
    }
  };

  useEffect(() => {
    const keyDownHandler = async (event) => {
      if (event.key === 'Enter' && !!password && document.activeElement?.id === 'password-input') {
        event.preventDefault();
        await handleVerifyPassword();
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [password]);

  const handleForgotPassword = () => {
    navigate('/forgotPassword');
  };

  return (
    <ScreenContainer>
      <AppVersion>{t('BETA_VERSION')}</AppVersion>
      <ContentContainer style={styles}>
        <TopSectionContainer>
          <Logo src={logo} />
          <LandingTitle>{t('WELCOME_MESSAGE_FIRST_LOGIN')}</LandingTitle>
        </TopSectionContainer>
        <PasswordInputLabel>{t('PASSWORD_INPUT_LABEL')}</PasswordInputLabel>
        <PasswordInputContainer>
          <PasswordInput
            id="password-input"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            placeholder={t('PASSWORD_INPUT_PLACEHOLDER')}
            autoFocus
          />
          <IconButton type="button" onClick={handleTogglePasswordView}>
            <img src={isPasswordVisible ? Eye : EyeSlash} alt="show-password" height={24} />
          </IconButton>
        </PasswordInputContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <ButtonContainer>
          <Button
            onClick={handleVerifyPassword}
            title={t('VERIFY_PASSWORD_BUTTON')}
            loading={isVerifying}
          />
        </ButtonContainer>
        <ForgotPasswordButton onClick={handleForgotPassword}>
          {t('FORGOT_PASSWORD_BUTTON')}
        </ForgotPasswordButton>
      </ContentContainer>
    </ScreenContainer>
  );
}
export default Login;
