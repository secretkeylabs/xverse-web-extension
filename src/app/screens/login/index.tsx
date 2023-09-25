import { useTranslation } from 'react-i18next';
import logo from '@assets/img/xverse_logo.svg';
import styled from 'styled-components';
import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addHours, addMinutes } from 'date-fns';
import useWalletReducer from '@hooks/useWalletReducer';
import { animated, useSpring } from '@react-spring/web';
import ActionButton from '@components/button';
import useCacheMigration from '@hooks/useCacheMigration';
import MigrationConfirmation from '@screens/migrationConfirmation';
import { decryptSeedPhrase } from '@utils/encryptionUtils';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletSession from '@hooks/useWalletSession';

declare const VERSION: string;

const Logo = styled.img({
  width: 57,
  height: 57,
});

const Button = styled.button({
  background: 'none',
});

const ScreenContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: 18,
  paddingRight: 18,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const ContentContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const AppVersion = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white_0,
  textAlign: 'right',
  marginTop: props.theme.spacing(8),
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
  ...props.theme.body_medium_m,
  textAlign: 'left',
  marginTop: props.theme.spacing(15.5),
}));

const PasswordInputContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  border: `1px solid ${props.theme.colors.elevation3}`,
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  borderRadius: props.theme.radius(1),
  marginTop: props.theme.spacing(4),
}));

const PasswordInput = styled.input((props) => ({
  ...props.theme.body_medium_m,
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
  marginTop: props.theme.spacing(8),
  width: '100%',
}));

const ErrorMessage = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.feedback.error,
  marginTop: props.theme.spacing(4),
}));

const ForgotPasswordButton = styled.a((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  marginTop: props.theme.spacing(12),
  color: props.theme.colors.white_0,
  textDecoration: 'underline',
}));

function Login(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'LOGIN_SCREEN' });
  const navigate = useNavigate();
  const { unlockWallet } = useWalletReducer();
  const { encryptedSeed } = useWalletSelector();

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
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
  const { migrateCachedStorage } = useCacheMigration();

  const handleSkipMigration = async () => {
    await unlockWallet(password);
    setIsVerifying(false);
    const skipTime = new Date().getTime();
    const migrationReminder = addMinutes(skipTime, 10).getTime();
    localStorage.setItem('migrationReminder', migrationReminder.toString());
    navigate(-1);
  };

  const handleMigrateCache = async () => {
    await migrateCachedStorage(password);
    setIsVerifying(false);
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

  const handleVerifyPassword = async () => {
    setIsVerifying(true);
    try {
      await decryptSeedPhrase(encryptedSeed, password);
      const hasMigrated = localStorage.getItem('migrated');
      const isReminderDue =
        Number(localStorage.getItem('migrationReminder') || 0) <= new Date().getTime();
      if (!hasMigrated && isReminderDue) {
        setShowMigration(true);
      } else {
        await unlockWallet(password);
        setIsVerifying(false);
        navigate(-1);
      }
    } catch (err) {
      setIsVerifying(false);
      setError(t('VERIFY_PASSWORD_ERROR'));
    }
  };

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleVerifyPassword();
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
          <AppVersion>Beta</AppVersion>
          <ContentContainer style={styles}>
            <TopSectionContainer>
              <Logo src={logo} />
              <LandingTitle>{t('WELCOME_MESSAGE_FIRST_LOGIN')}</LandingTitle>
            </TopSectionContainer>
            <PasswordInputLabel>{t('PASSWORD_INPUT_LABEL')}</PasswordInputLabel>
            <PasswordInputContainer>
              <PasswordInput
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder={t('PASSWORD_INPUT_PLACEHOLDER')}
                autoFocus
              />
              <Button type="button" onClick={handleTogglePasswordView}>
                <img src={isPasswordVisible ? Eye : EyeSlash} alt="show-password" height={24} />
              </Button>
            </PasswordInputContainer>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <ButtonContainer>
              <ActionButton
                onPress={handleVerifyPassword}
                text={t('VERIFY_PASSWORD_BUTTON')}
                processing={isVerifying}
              />
            </ButtonContainer>
            <ForgotPasswordButton onClick={handleForgotPassword}>
              {t('FORGOT_PASSWORD_BUTTON')}
            </ForgotPasswordButton>
          </ContentContainer>
        </ScreenContainer>
      ) : (
        <MigrationConfirmation
          migrateCallback={handleMigrateCache}
          skipCallback={handleSkipMigration}
        />
      )}
    </>
  );
}
export default Login;
