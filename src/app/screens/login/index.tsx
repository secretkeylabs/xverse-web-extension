import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import logo from '@assets/img/xverse_logo.svg';
import useSanityCheck from '@hooks/useSanityCheck';
import useSeedVault from '@hooks/useSeedVault';
import useSeedVaultMigration from '@hooks/useSeedVaultMigration';
import useWalletReducer from '@hooks/useWalletReducer';
import { animated, useSpring } from '@react-spring/web';
import MigrationConfirmation from '@screens/migrationConfirmation';
import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Logo = styled.img({
  width: 57,
  height: 57,
});

const IconButton = styled.button({
  background: 'none',
});

const ScreenContainer = styled(animated.div)((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.spacing(9),
  paddingRight: props.theme.spacing(9),
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const ContentContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const AppVersion = styled.p((props) => ({
  ...props.theme.typography.body_s,
  color: props.theme.colors.white_0,
  textAlign: 'right',
  marginTop: props.theme.space.m,
}));

const TopSectionContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(60),
  marginBottom: props.theme.spacing(30),
}));

const PasswordInputLabel = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  marginTop: props.theme.spacing(15.5),
}));

const PasswordInputContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  border: `1px solid ${props.theme.colors.elevation3}`,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  borderRadius: props.theme.radius(1),
  marginTop: props.theme.space.xs,
}));

const PasswordInput = styled.input((props) => ({
  ...props.theme.typography.body_medium_m,
  height: 44,
  backgroundColor: props.theme.colors.elevation0,
  color: props.theme.colors.white_0,
  width: '100%',
  border: 'none',
}));

const LandingTitle = styled.h1((props) => ({
  ...props.theme.tile_text,
  paddingTop: props.theme.spacing(15),
  paddingLeft: props.theme.spacing(34),
  paddingRight: props.theme.spacing(34),
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

const ButtonContainer = styled.div((props) => ({
  marginTop: props.theme.space.m,
  width: '100%',
}));

const ErrorMessage = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.feedback.error,
  marginTop: props.theme.space.xs,
}));

const ForgotPasswordButton = styled.button((props) => ({
  ...props.theme.typography.body_m,
  textAlign: 'center',
  marginTop: props.theme.space.l,
  color: props.theme.colors.white_0,
  textDecoration: 'underline',
  backgroundColor: 'transparent',
  ':hover': {
    textDecoration: 'none',
  },
}));

function Login(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'LOGIN_SCREEN' });
  const navigate = useNavigate();
  const { unlockWallet } = useWalletReducer();
  const { hasSeed } = useSeedVault();
  const { getSanityCheck } = useSanityCheck();
  const { migrateCachedStorage, isVaultUpdated } = useSeedVaultMigration();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showMigration, setShowMigration] = useState(false);

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
      const sanityCheck = await getSanityCheck('X-Current-Version');
      if (!hasMigrated && sanityCheck) {
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
