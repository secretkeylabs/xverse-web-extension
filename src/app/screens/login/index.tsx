import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import logo from '@assets/img/xverse_logo.svg';
import useSeedVault from '@hooks/useSeedVault';
import useSeedVaultMigration from '@hooks/useSeedVaultMigration';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSession from '@hooks/useWalletSession';
import { useSpring } from '@react-spring/web';
import MigrationConfirmation from '@screens/migrationConfirmation';
import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { trackMixPanel } from '@utils/mixpanel';
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
  const { hasSeed } = useSeedVault();
  const { migrateCachedStorage, isVaultUpdated } = useSeedVaultMigration();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
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

  useEffect(() => {
    hasSeed().then((hasSeedPhrase) => {
      if (!hasSeedPhrase) {
        navigate('/landing');
      }
    });
  }, [hasSeed, navigate]);

  const handleMigrateCache = async () => {
    try {
      await migrateCachedStorage();
      trackMixPanel(AnalyticsEvents.WalletMigrated);
    } catch (err) {
      setShowMigration(false);
    }
  };

  const handleTogglePasswordView = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handlePasswordChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (error) {
      setError('');
    }
    setPassword(event.currentTarget.value);
  };

  const onPasswordVerify = async () => {
    // Check for SeedVault Migrations
    try {
      const hasMigrated = await isVaultUpdated();
      if (!hasMigrated) {
        setShowMigration(true);
      } else {
        setIsVerifying(false);
        navigate(-1);
      }
    } catch (err) {
      setIsVerifying(false);
      navigate(-1);
    }
  };

  const handleVerifyPassword = async () => {
    setIsVerifying(true);
    try {
      await setSessionStartTime();
      await unlockWallet(password);
      await onPasswordVerify();
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
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {!showMigration ? (
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
      ) : (
        <MigrationConfirmation migrateCallback={handleMigrateCache} />
      )}
    </>
  );
}
export default Login;
