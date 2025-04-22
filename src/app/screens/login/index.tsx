import logo from '@assets/img/full_logo_horizontal.svg';
import { valibotResolver } from '@hookform/resolvers/valibot';
import useAsyncFn from '@hooks/useAsyncFn';
import useVault from '@hooks/useVault';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSession from '@hooks/useWalletSession';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useSpring } from '@react-spring/web';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Theme from 'theme';
import * as v from 'valibot';
import {
  AppVersion,
  ButtonContainer,
  ContentContainer,
  ForgotPasswordButton,
  LandingTitle,
  Logo,
  ScreenContainer,
  StyledButton,
  TopSectionContainer,
} from './index.styled';

type FormValues = {
  password: string;
};

function Login(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'LOGIN_SCREEN' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'COMMON' });

  const navigate = useNavigate();
  const { unlockWallet } = useWalletReducer();
  const vault = useVault();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { setSessionStartTime } = useWalletSession();

  const formSchema = v.object({
    password: v.pipe(v.string(), v.trim(), v.nonEmpty(tCommon('FIELD_REQUIRED'))),
  });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
  });

  const password = watch('password');

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

  const handleVerifyPassword = async (formData: FormValues) => {
    setIsVerifying(true);
    try {
      await setSessionStartTime();
      await unlockWallet(formData.password);
      setIsVerifying(false);
      navigate(-1);
    } catch (err) {
      setIsVerifying(false);
      setError('password', { message: t('VERIFY_PASSWORD_ERROR') });
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgotPassword');
  };

  return (
    <ScreenContainer>
      <AppVersion>{t('BETA_VERSION')}</AppVersion>
      <ContentContainer style={styles}>
        <TopSectionContainer>
          <Logo src={logo} />
          <LandingTitle typography="body_medium_l" color="white_200">
            {t('SCREEN_TITLE')}
          </LandingTitle>
        </TopSectionContainer>
        <form onSubmit={handleSubmit(handleVerifyPassword)}>
          <Input
            {...register('password')}
            titleElement={t('PASSWORD_INPUT_LABEL')}
            id="password-input"
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder={t('PASSWORD_INPUT_PLACEHOLDER')}
            autoFocus
            complications={
              <StyledButton type="button" onClick={handleTogglePasswordView}>
                {isPasswordVisible ? (
                  <Eye weight="fill" size={20} color={Theme.colors.white_200} />
                ) : (
                  <EyeSlash weight="fill" size={20} color={Theme.colors.white_200} />
                )}
              </StyledButton>
            }
            feedback={
              errors.password?.message
                ? [{ message: errors.password.message, variant: 'danger' }]
                : undefined
            }
            hideClear
          />
          <ButtonContainer>
            <Button
              title={t('VERIFY_PASSWORD_BUTTON')}
              loading={isSubmitting || isVerifying}
              disabled={!password || isSubmitting || isVerifying}
            />
          </ButtonContainer>
          <ForgotPasswordButton onClick={handleForgotPassword}>
            {t('FORGOT_PASSWORD_BUTTON')}
          </ForgotPasswordButton>
        </form>
      </ContentContainer>
    </ScreenContainer>
  );
}
export default Login;
