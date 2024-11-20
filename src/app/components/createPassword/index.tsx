import { Eye, EyeSlash } from '@phosphor-icons/react';
import { animated, useTransition } from '@react-spring/web';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import zxcvbn from 'zxcvbn';
import {
  ButtonContainer,
  Container,
  Description,
  PasswordInputLabel,
  PasswordStrengthContainer,
  StrengthBar,
  StyledButton,
  Title,
  Wrapper,
} from './index.styled';

enum PasswordStrength {
  NoScore,
  PoorScore,
  WeakScore,
  AverageScore,
  StrongScore,
  MeetsAllRequirements,
}

type Props = {
  submitButtonText?: string;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  handleContinue: () => void;
  confirmPasswordError?: string;
  checkPasswordStrength?: boolean;
  loading?: boolean;
};

function CreatePassword({
  submitButtonText,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  confirmPasswordError,
  handleContinue,
  checkPasswordStrength,
  loading,
}: Props): JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    PasswordStrength.NoScore,
  );

  const { score } = zxcvbn(password);
  const transition = useTransition(passwordStrength, {
    from: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
  });
  const passwordLength = password.length;
  let passwordStrengthLabel;
  if (!password) {
    passwordStrengthLabel = {
      color: theme.colors.white_600,
      width: '0',
      message: '',
    };
  } else if (score <= PasswordStrength.WeakScore) {
    passwordStrengthLabel = {
      color: theme.colors.danger_medium,
      width: '20%',
      message: <p style={{ color: theme.colors.danger_medium }}>{t('PASSWORD_STRENGTH_WEAK')}</p>,
    };
  } else if (score <= PasswordStrength.AverageScore) {
    passwordStrengthLabel = {
      color: theme.colors.caution,
      width: '50%',
      message: <p>{t('PASSWORD_STRENGTH_MEDIUM')}</p>,
    };
  } else {
    passwordStrengthLabel = {
      color: theme.colors.success_medium,
      width: '100%',
      message: <p>{t('PASSWORD_STRENGTH_STRONG')}</p>,
    };
  }

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (
        event.key === 'Enter' &&
        document.activeElement?.id === 'password-input' &&
        !!password &&
        (checkPasswordStrength ? score >= PasswordStrength.AverageScore : true)
      ) {
        event.preventDefault();
        handleContinue();
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [checkPasswordStrength, password, passwordLength, handleContinue, score]);

  useEffect(() => {
    if (password !== '') {
      setPasswordStrength(score);
    }
    return () => {
      setPasswordStrength(PasswordStrength.NoScore);
    };
  }, [password, score, setPasswordStrength]);

  return (
    <Container>
      <Wrapper>
        <Title>{t('CREATE_PASSWORD_TITLE')}</Title>
        <Description>{t('CREATE_PASSWORD_DESCRIPTION')}</Description>
        <PasswordInputLabel>{t('CREATE_PASSWORD_LABEL')}</PasswordInputLabel>
        <Input
          id="password-input"
          type={isPasswordVisible ? 'text' : 'password'}
          placeholder={t('CREATE_PASSWORD_PLACEHOLDER')}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          complications={
            <StyledButton onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
              {isPasswordVisible ? (
                <Eye size={24} color={theme.colors.white_0} weight="fill" />
              ) : (
                <EyeSlash size={24} color={theme.colors.white_0} weight="fill" />
              )}
            </StyledButton>
          }
          hideClear
          autoFocus
        />
        <PasswordStrengthContainer $visibility={!!checkPasswordStrength}>
          <span>{t('PASSWORD_STRENGTH_LABEL')}</span>
          <StrengthBar
            $strengthColor={passwordStrengthLabel.color}
            $strengthWidth={passwordStrengthLabel.width}
          >
            {transition((style) => (
              <animated.div style={style} />
            ))}
          </StrengthBar>
          {passwordStrengthLabel.message}
        </PasswordStrengthContainer>
        <PasswordInputLabel>{t('CONFIRM_PASSWORD_LABEL')}</PasswordInputLabel>
        <Input
          id="confirm-password-input"
          type={isConfirmPasswordVisible ? 'text' : 'password'}
          placeholder={t('CONFIRM_PASSWORD_PLACEHOLDER')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          complications={
            <StyledButton onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
              {isConfirmPasswordVisible ? (
                <Eye size={24} color={theme.colors.white_0} weight="fill" />
              ) : (
                <EyeSlash size={24} color={theme.colors.white_0} weight="fill" />
              )}
            </StyledButton>
          }
          feedback={
            confirmPasswordError
              ? [{ message: confirmPasswordError, variant: 'danger' }]
              : undefined
          }
          hideClear
        />
      </Wrapper>
      <ButtonContainer $ifError={!!confirmPasswordError}>
        <Button
          loading={loading}
          disabled={
            !password ||
            !confirmPassword ||
            (!!checkPasswordStrength && score <= PasswordStrength.WeakScore)
          }
          title={submitButtonText || t('CONTINUE_BUTTON')}
          onClick={handleContinue}
          type="submit"
        />
      </ButtonContainer>
    </Container>
  );
}

export default CreatePassword;
