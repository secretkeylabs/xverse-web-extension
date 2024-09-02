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

const REQUIRED_PASSWORD_LENGTH = 5;

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
  handleBack: () => void;
  passwordError?: string;
  checkPasswordStrength?: boolean;
  stackButtonAlignment?: boolean;
  loading?: boolean;
  createPasswordFlow?: boolean;
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
  createPasswordFlow,
  autoFocus = false,
}: Props): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const theme = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    PasswordStrength.NoScore,
  );
  const { score } = zxcvbn(enteredPassword);
  const enteredPasswordLength = enteredPassword.length;
  const [error, setError] = useState<string>(passwordError ?? '');
  const transition = useTransition(passwordStrength, {
    from: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
  });

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (
        event.key === 'Enter' &&
        !!enteredPassword &&
        enteredPasswordLength >= REQUIRED_PASSWORD_LENGTH &&
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
  }, [enteredPassword]);

  useEffect(() => {
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (enteredPassword && !!createPasswordFlow && score <= PasswordStrength.WeakScore) {
      setError(t('PASSWORD_STRENGTH_ERROR'));
      return;
    }
    setError('');
  }, [passwordError, enteredPassword]);

  useEffect(() => {
    if (enteredPassword !== '') {
      setPasswordStrength(score);
    }

    return () => {
      setPasswordStrength(PasswordStrength.NoScore);
    };
  }, [enteredPassword, setPasswordStrength]);

  const handleTogglePasswordView = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handlePasswordChange = (event: React.FormEvent<HTMLInputElement>) => {
    setEnteredPassword(event.currentTarget.value);
  };

  const renderStrengthBar = () => {
    if (enteredPassword !== '') {
      if (
        enteredPasswordLength <= REQUIRED_PASSWORD_LENGTH ||
        score <= PasswordStrength.WeakScore
      ) {
        return (
          <PasswordStrengthContainer>
            <span>{t('PASSWORD_STRENGTH_LABEL')}</span>
            <StrengthBar $strengthColor={theme.colors.feedback.error} $strengthWidth="20%">
              {transition((style) => (
                <animated.div style={style} />
              ))}
            </StrengthBar>
            <p style={{ color: theme.colors.feedback.error }}>{t('PASSWORD_STRENGTH_WEAK')}</p>
          </PasswordStrengthContainer>
        );
      }

      if (score <= PasswordStrength.AverageScore) {
        return (
          <PasswordStrengthContainer>
            <span>{t('PASSWORD_STRENGTH_LABEL')}</span>
            {transition((style) => (
              <StrengthBar $strengthColor={theme.colors.feedback.caution} $strengthWidth="50%">
                <animated.div style={style} />
              </StrengthBar>
            ))}
            <p>{t('PASSWORD_STRENGTH_MEDIUM')}</p>
          </PasswordStrengthContainer>
        );
      }

      return (
        <PasswordStrengthContainer>
          <span>{t('PASSWORD_STRENGTH_LABEL')}</span>
          {transition((style) => (
            <StrengthBar $strengthColor={theme.colors.feedback.success} $strengthWidth="100%">
              <animated.div style={style} />
            </StrengthBar>
          ))}
          <p>{t('PASSWORD_STRENGTH_STRONG')}</p>
        </PasswordStrengthContainer>
      );
    }
    return (
      <PasswordStrengthContainer>
        <span>{t('PASSWORD_STRENGTH_LABEL')}</span>
        <StrengthBar $strengthColor={theme.colors.white_600} $strengthWidth="0">
          {transition((style) => (
            <animated.div style={style} />
          ))}
        </StrengthBar>
      </PasswordStrengthContainer>
    );
  };

  return (
    <Container>
      <HeaderContainer>
        <img src={PasswordIcon} alt="password" />
        <HeaderText>{title}</HeaderText>
      </HeaderContainer>
      <PasswordInputLabel>{inputLabel}</PasswordInputLabel>
      <Input
        key={`${title}-${inputLabel}`}
        type={isPasswordVisible ? 'text' : 'password'}
        value={enteredPassword}
        onChange={handlePasswordChange}
        autoFocus={autoFocus}
        complications={
          <StyledButton onClick={handleTogglePasswordView}>
            <img
              src={isPasswordVisible ? Eye : EyeSlash}
              alt="toggle password visibility"
              height={24}
            />
          </StyledButton>
        }
        feedback={error !== '' ? [{ message: error, variant: 'danger' }] : undefined}
        hideClear
      />
      {checkPasswordStrength ? renderStrengthBar() : null}
      <ButtonsContainer stackButtonAlignment={stackButtonAlignment} ifError={error !== ''}>
        <ButtonContainer stackButtonAlignment={stackButtonAlignment}>
          <Button title={t('BACK_BUTTON')} onClick={handleBack} variant="secondary" />
        </ButtonContainer>
        <ButtonContainer stackButtonAlignment={stackButtonAlignment}>
          <Button
            loading={loading}
            disabled={
              !enteredPassword || (!!checkPasswordStrength && score <= PasswordStrength.WeakScore)
            }
            title={submitButtonText || t('CONTINUE_BUTTON')}
            onClick={handleContinue}
          />
        </ButtonContainer>
      </ButtonsContainer>
    </Container>
  );
}

export default PasswordInput;
