import { useTranslation } from 'react-i18next';
import logo from '@assets/img/full_logo_vertical.svg';
import styled from 'styled-components';
import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import { useState } from 'react';
import { decryptSeedPhrase } from '@utils/encryptionUtils';
import { getEncryptedSeed } from '@utils/localStorage';
import { walletFromSeedPhrase } from '@core/wallet';
import { useDispatch } from 'react-redux';
import { setWalletAction } from '@stores/wallet/actions/actionCreators';
import { useNavigate } from 'react-router-dom';

const ScreenContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.spacing(9),
  paddingRight: props.theme.spacing(9),
}));

const AppVersion = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['0'],
  textAlign: 'right',
  marginTop: props.theme.spacing(8),
}));

const TopSectionContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(50),
  marginBottom: props.theme.spacing(15),
}));

const PasswordInputLabel = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
}));

const PasswordInputContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  border: '1px solid #303354;',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  borderRadius: props.theme.radius(1),
  marginTop: props.theme.spacing(4),
}));

const PasswordInput = styled.input((props) => ({
  ...props.theme.body_medium_m,
  height: 44,
  backgroundColor: props.theme.colors.background.elevation0,
  color: props.theme.colors.white['0'],
  width: '100%',
  border: 'none',
}));

const LandingTitle = styled.h1((props) => ({
  ...props.theme.tile_text,
  paddingTop: props.theme.spacing(15),
  paddingLeft: props.theme.spacing(34),
  paddingRight: props.theme.spacing(34),
  color: props.theme.colors.white['200'],
  textAlign: 'center',
}));

const VerifyButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(8),
  width: '100%',
  height: 44,
}));

const ErrorMessage = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.feedback.error,
  marginTop: props.theme.spacing(4),
}));

function Login(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'LOGIN_SCREEN' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);

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
    const seed = getEncryptedSeed();
    try {
      if (seed) {
        const decrypted = await decryptSeedPhrase(seed, password);
        const wallet = await walletFromSeedPhrase(decrypted);
        dispatch(setWalletAction(wallet));
        setIsVerifying(false);
        navigate('/');
      }
    } catch (err) {
      setIsVerifying(false);
      setError(t('VERIFY_PASSWORD_ERROR'));
    }
  };

  return (
    <ScreenContainer>
      <AppVersion>V 1.0.0</AppVersion>
      <TopSectionContainer>
        <img src={logo} width={100} alt="logo" />
        <LandingTitle>{t('WELCOME_MESSAGE_FIRST_LOGIN')}</LandingTitle>
      </TopSectionContainer>
      <PasswordInputLabel>{t('PASSWORD_INPUT_LABEL')}</PasswordInputLabel>
      <PasswordInputContainer>
        <PasswordInput
          type={isPasswordVisible ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          placeholder={t('PASSWORD_INPUT_PLACEHOLDER')}
        />
        <button type="button" onClick={handleTogglePasswordView} style={{ background: 'none' }}>
          <img src={isPasswordVisible ? Eye : EyeSlash} alt="show-password" height={24} />
        </button>
      </PasswordInputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <VerifyButton onClick={handleVerifyPassword}>
        {t('VERIFY_PASSWORD_BUTTON')}
      </VerifyButton>
    </ScreenContainer>
  );
}
export default Login;
