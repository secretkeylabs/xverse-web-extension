import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import PasswordIcon from '@assets/img/createPassword/Password.svg';
import { useEffect, useState } from 'react';
import ActionButton from '@components/button';

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

const PasswordInputContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  border: '1px solid #303354',
  backgroundColor: props.theme.colors.background.elevation0,
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
  backgroundColor: props.theme.colors.background.elevation0,
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
});

const ErrorMessage = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.feedback.error,
}));

const PasswordStrengthContainer = styled.div((props) => ({
  ...props.theme.body_medium_m,
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginTop: props.theme.spacing(8),
  justifyContent: 'space-between',
}));

const StrengthBar = styled.div<StrengthBarProps>((props) => ({
  display: 'flex',
  alignItems: 'center',
  height: 4,
  backgroundColor: props.strengthColor,
  color: props.strengthColor,
  width: '50%',
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

  useEffect(() => {
    if (passwordError) { setError(passwordError); }
  }, [passwordError]);

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
            {t('PASSWORD_STRENGTH_LABEL')}
            <StrengthBar strengthColor={theme.colors.feedback.error} />
            {t('PASSWORD_STRENGTH_WEAK')}
          </PasswordStrengthContainer>
        );
      }
      if (enteredPassword.length <= PasswordStrength.MEDIUM) {
        return (
          <PasswordStrengthContainer>
            {t('PASSWORD_STRENGTH_LABEL')}
            <StrengthBar strengthColor={theme.colors.feedback.caution} />
            {t('PASSWORD_STRENGTH_MEDIUM')}
          </PasswordStrengthContainer>
        );
      }
      return (
        <PasswordStrengthContainer>
          {t('PASSWORD_STRENGTH_LABEL')}
          <StrengthBar strengthColor={theme.colors.feedback.success} />
          {t('PASSWORD_STRENGTH_STRONG')}
        </PasswordStrengthContainer>
      );
    }
    return (
      <PasswordStrengthContainer>
        {t('PASSWORD_STRENGTH_LABEL')}
        <StrengthBar strengthColor={theme.colors.background.elevation2} />
      </PasswordStrengthContainer>
    );
  }

  const checkStrengthAndContinue = () => {
    if (enteredPassword && passwordStrength !== PasswordStrength.WEAK) {
      handleContinue();
    } else {
      setError(t('PASSWORD_STRENGTH_ERROR'));
    }
  };

  return (
    <Container>
      <HeaderContainer>
        <img src={PasswordIcon} alt="passoword" />
        <HeaderText>{title}</HeaderText>
      </HeaderContainer>
      <PasswordInputLabel>{inputLabel}</PasswordInputLabel>
      <PasswordInputContainer>
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
      {checkPasswordStrength && (enteredPassword.length > 0 ? renderStrengthBar() : null)}
      <ButtonsContainer stackButtonAlignment={stackButtonAlignment} ifError={error !== ''}>
        <ButtonContainer stackButtonAlignment={stackButtonAlignment}>
          <ActionButton
            text={t('BACK_BUTTON')}
            onPress={handleBack}
            transparent
          />
        </ButtonContainer>

        <ActionButton
          processing={loading}
          text={t('CONTINUE_BUTTON')}
          onPress={checkPasswordStrength ? checkStrengthAndContinue : handleContinue}
        />
      </ButtonsContainer>
    </Container>
  );
}

export default PasswordInput;
