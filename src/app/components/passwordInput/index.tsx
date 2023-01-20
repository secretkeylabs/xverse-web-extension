import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import PasswordIcon from '@assets/img/createPassword/Password.svg';
import { useEffect, useState } from 'react';
import ActionButton from '@components/button';
import { animated, useTransition } from '@react-spring/web';

interface PasswordInputProps {
  title: string;
  inputLabel: string;
  enteredPassword: string;
  setEnteredPassword: (enteredPassword: string) => void;
  handleContinue: () => void;
  handleBack: () => void;
  passwordError?: string;
  checkPasswordStrength? : boolean;
  stackButtonAlignment? : boolean;
  loading?: boolean;
}

interface StrengthBarProps {
  strengthColor:string
  strengthWidth: string
}

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

const HeaderText = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
  marginTop: props.theme.spacing(15),
}));

const HeaderContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

interface PasswordInputContainerProps {
  hasError: boolean;
}

const PasswordInputContainer = styled.div<PasswordInputContainerProps>((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  border: `1px solid ${
    props.hasError ? 'rgba(211, 60, 60, 0.3)' : props.theme.colors.background.elevation3
  }`,
  backgroundColor: props.theme.colors.background['elevation-1'],
  borderRadius: props.theme.radius(1),
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(3),
}));

const PasswordInputLabel = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(24),
  textAlign: 'left',
}));

const Input = styled.input((props) => ({
  ...props.theme.body_medium_m,
  height: 44,
  backgroundColor: props.theme.colors.background['elevation-1'],
  color: props.theme.colors.white['0'],
  width: '100%',
  border: 'none',
}));

interface ButtonContainerProps {
  stackButtonAlignment: boolean;
  ifError: boolean;
}
const ButtonsContainer = styled.div<ButtonContainerProps>((props) => ({
  display: 'flex',
  flexDirection: props.stackButtonAlignment ? 'column-reverse' : 'row',
  alignItems: props.stackButtonAlignment ? 'center' : 'flex-end',
  flex: 1,
  marginTop: props.ifError ? props.theme.spacing(30) : props.theme.spacing(40),
  marginBottom: props.theme.spacing(8),
}));

const Button = styled.button({
  background: 'none',
  display: 'flex',
});

const ErrorMessage = styled.h2((props) => ({
  ...props.theme.body_xs,
  textAlign: 'left',
  color: props.theme.colors.feedback.error,
}));

const PasswordStrengthContainer = styled.div((props) => ({
  ...props.theme.body_medium_m,
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginTop: props.theme.spacing(8),
  span: {
    opacity: 0.6,
  },
  p: {
    justifySelf: 'flex-end',
  },
}));

const StrengthBar = styled(animated.div)<StrengthBarProps>((props) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: props.theme.colors.white[600],
  marginLeft: props.theme.spacing(6),
  marginRight: props.theme.spacing(9),
  borderRadius: props.theme.radius(1),
  width: '50%',
  div: {
    width: props.strengthWidth,
    height: 4,
    backgroundColor: props.strengthColor,
    borderRadius: props.theme.radius(1),
  },
}));

export enum PasswordStrength {
  WEAK = 5,
  MEDIUM = 8,
  STRONG = 12,
  EMPTY = 0,
}

interface TransparentButtonContainerProps {
  stackButtonAlignment: boolean;
}
const ButtonContainer = styled.div<TransparentButtonContainerProps>((props) => ({
  marginLeft: props.stackButtonAlignment ? 0 : 3,
  marginRight: props.stackButtonAlignment ? 0 : 3,
  marginTop: props.theme.spacing(4),
  width: '100%',
}));

function PasswordInput(props: PasswordInputProps): JSX.Element {
  const {
    title,
    inputLabel,
    enteredPassword,
    passwordError,
    setEnteredPassword,
    handleContinue,
    handleBack,
    checkPasswordStrength,
    stackButtonAlignment = false,
    loading,
  } = props;

  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const theme = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    PasswordStrength.EMPTY,
  );
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
    if (passwordError) { setError(passwordError); return; }
    if (enteredPassword && enteredPassword.length <= PasswordStrength.WEAK) { setError(t('PASSWORD_STRENGTH_ERROR')); return; }
    setError('');
  }, [passwordError, enteredPassword]);

  useEffect(() => {
    if (enteredPassword !== '') {
      const passwordLength = enteredPassword.length;
      if (passwordLength <= PasswordStrength.WEAK) {
        setPasswordStrength(PasswordStrength.WEAK);
      } else if (passwordLength <= PasswordStrength.MEDIUM) {
        setPasswordStrength(PasswordStrength.MEDIUM);
      } else if (passwordLength >= PasswordStrength.STRONG) {
        setPasswordStrength(PasswordStrength.MEDIUM);
      }
    }
    return () => {
      setPasswordStrength(PasswordStrength.EMPTY);
    };
  }, [enteredPassword, setPasswordStrength]);

  const handleTogglePasswordView = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handlePasswordChange = (event: React.FormEvent<HTMLInputElement>) => {
    setEnteredPassword(event.currentTarget.value);
  };

  function renderStrengthBar() {
    if (enteredPassword !== '') {
      if (enteredPassword.length <= PasswordStrength.WEAK) {
        return (
          <PasswordStrengthContainer>
            <span>{t('PASSWORD_STRENGTH_LABEL')}</span>
            <StrengthBar strengthColor={theme.colors.feedback.error} strengthWidth="20%">
              {transition((style) => (
                <animated.div style={style} />
              ))}
            </StrengthBar>
            <p style={{ color: theme.colors.feedback.error }}>{t('PASSWORD_STRENGTH_WEAK')}</p>
          </PasswordStrengthContainer>
        );
      }
      if (enteredPassword.length <= PasswordStrength.MEDIUM) {
        return (
          <PasswordStrengthContainer>
            <span>{t('PASSWORD_STRENGTH_LABEL')}</span>
            {transition((style) => (
              <StrengthBar strengthColor={theme.colors.feedback.caution} strengthWidth="50%">
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
            <StrengthBar strengthColor={theme.colors.feedback.success} strengthWidth="100%">
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
        <StrengthBar strengthColor={theme.colors.white[600]} strengthWidth="0">
          {transition((style) => (
            <animated.div style={style} />
          ))}
        </StrengthBar>
      </PasswordStrengthContainer>
    );
  }

  return (
    <Container>
      <HeaderContainer>
        <img src={PasswordIcon} alt="password" />
        <HeaderText>{title}</HeaderText>
      </HeaderContainer>
      <PasswordInputLabel>{inputLabel}</PasswordInputLabel>
      <PasswordInputContainer hasError={!!error || (enteredPassword !== '' && enteredPassword.length <= PasswordStrength.WEAK)}>
        <Input
          type={isPasswordVisible ? 'text' : 'password'}
          value={enteredPassword}
          onChange={handlePasswordChange}

        />
        <Button onClick={handleTogglePasswordView}>
          <img src={isPasswordVisible ? Eye : EyeSlash} alt="show-password" height={24} />
        </Button>
      </PasswordInputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {checkPasswordStrength ? renderStrengthBar() : null}
      <ButtonsContainer stackButtonAlignment={stackButtonAlignment} ifError={error !== ''}>
        <ButtonContainer stackButtonAlignment={stackButtonAlignment}>
          <ActionButton
            text={t('BACK_BUTTON')}
            onPress={handleBack}
            transparent
          />
        </ButtonContainer>
        <ButtonContainer stackButtonAlignment={stackButtonAlignment}>
          <ActionButton
            processing={loading}
            disabled={!enteredPassword || enteredPassword.length <= PasswordStrength.WEAK}
            text={t('CONTINUE_BUTTON')}
            onPress={handleContinue}
          />
        </ButtonContainer>
      </ButtonsContainer>
    </Container>
  );
}

export default PasswordInput;
