import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import PasswordIcon from '@assets/img/createPassword/Password.svg';
import { animated, useTransition } from '@react-spring/web';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import zxcvbn from 'zxcvbn';
import {
  ButtonContainer,
  ButtonsContainer,
  Container,
  HeaderContainer,
  HeaderText,
  PasswordInputLabel,
  PasswordStrengthContainer,
  StrengthBar,
  StyledButton,
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
  title: string;
  inputLabel: string;
  submitButtonText?: string;
  enteredPassword: string;
  setEnteredPassword: (enteredPassword: string) => void;
  handleContinue: () => void;
  handleBack?: () => void;
  passwordError?: string;
  checkPasswordStrength?: boolean;
  stackButtonAlignment?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
};

function PasswordInput({
  title,
  inputLabel,
  submitButtonText,
  enteredPassword,
  passwordError,
  setEnteredPassword,
  handleContinue,
  handleBack,
  checkPasswordStrength,
  stackButtonAlignment = false,
  loading,
  autoFocus = false,
}: Props): JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    PasswordStrength.NoScore,
  );

  const { score } = zxcvbn(enteredPassword);
  const transition = useTransition(passwordStrength, {
    from: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
  });
  const enteredPasswordLength = enteredPassword.length;
  let passwordStrengthLabel;
  if (!enteredPassword) {
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
        !!enteredPassword &&
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
  }, [checkPasswordStrength, enteredPassword, enteredPasswordLength, handleContinue, score]);

  useEffect(() => {
    if (enteredPassword !== '') {
      setPasswordStrength(score);
    }
    return () => {
      setPasswordStrength(PasswordStrength.NoScore);
    };
  }, [enteredPassword, score, setPasswordStrength]);

  return (
    <Container>
      <HeaderContainer>
        <img src={PasswordIcon} alt="password" />
        <HeaderText>{title}</HeaderText>
      </HeaderContainer>
      <PasswordInputLabel>{inputLabel}</PasswordInputLabel>
      <Input
        key={`${title}-${inputLabel}`}
        id="password-input"
        type={isPasswordVisible ? 'text' : 'password'}
        value={enteredPassword}
        onChange={(e) => setEnteredPassword(e.currentTarget.value)}
        autoFocus={autoFocus}
        complications={
          <StyledButton onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
            <img
              src={isPasswordVisible ? Eye : EyeSlash}
              alt="toggle password visibility"
              height={24}
            />
          </StyledButton>
        }
        feedback={passwordError ? [{ message: passwordError, variant: 'danger' }] : undefined}
        hideClear
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
      <ButtonsContainer $stackButtonAlignment={stackButtonAlignment} $ifError={!!passwordError}>
        {handleBack && (
          <ButtonContainer $stackButtonAlignment={stackButtonAlignment}>
            <Button
              title={t('BACK_BUTTON')}
              onClick={handleBack}
              variant="secondary"
              type="button"
            />
          </ButtonContainer>
        )}
        <ButtonContainer $stackButtonAlignment={stackButtonAlignment}>
          <Button
            loading={loading}
            disabled={
              !enteredPassword || (!!checkPasswordStrength && score <= PasswordStrength.WeakScore)
            }
            title={submitButtonText || t('CONTINUE_BUTTON')}
            onClick={handleContinue}
            type="submit"
          />
        </ButtonContainer>
      </ButtonsContainer>
    </Container>
  );
}

export default PasswordInput;
