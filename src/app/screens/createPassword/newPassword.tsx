import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import React, { useEffect, useState } from 'react';

interface NewPasswordProps {
  password: string,
  setPassword: (password: string) => void,
  handleContinue: () => void,
  handleBack: () => void,
}

const NewPasswordContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(24),
  flex: 1,
}));

const PasswordInputContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  border: '1px solid #303354;',
  borderRadius: props.theme.radius(1),
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
  marginTop: props.theme.spacing(4),
}));

const PasswordInputLabel = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'center',
}));

const PasswordInput = styled.input((props) => ({
  ...props.theme.body_medium_m,
  height: 44,
  backgroundColor: props.theme.colors.background.elevation0,
  color: props.theme.colors.white['0'],
  width: '100%',
  border: 'none',
}));

const PasswordStrengthContainer = styled.div((props) => ({
  ...props.theme.body_medium_m,
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginTop: props.theme.spacing(8),
  justifyContent: 'space-between',
}));

const StrengthBar = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  height: 4,
  backgroundColor: props.strengthColor,
  color: props.strengthColor,
  width: '50%',
}));

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  flex: 1,
  alignItems: 'flex-end',
  marginBottom: props.theme.spacing(20),
  width: '100%',
}));

const ContinueButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.action.classic,
  color: props.theme.colors.white['0'],
  width: '48%',
  height: 44,
}));

const BackButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: props.theme.colors.background.elevation0,
  border: '1px solid #272A44',
  color: props.theme.colors.white['0'],
  width: '48%',
  height: 44,
}));

const ErrorMessage = styled.h2((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'center',
  color: props.theme.colors.feedback.error,
  marginTop: props.theme.spacing(4),
}));

export enum PasswordStrength {
  WEAK = 5,
  MEDIUM = 8,
  STRONG = 12,
  EMPTY = 0,
}

function NewPassword(props: NewPasswordProps): JSX.Element {
  const {
    password,
    setPassword,
    handleContinue,
    handleBack,
  } = props;
  const theme = useTheme();
  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(PasswordStrength.EMPTY);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (password !== '') {
      const passwordLength = password.length;
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
  }, [password, setPasswordStrength]);

  const handleTogglePasswordView = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  function renderStrengthBar() {
    if (password !== '') {
      if (password.length <= PasswordStrength.WEAK) {
        return (
          <PasswordStrengthContainer>
            {t('PASSWORD_STRENGTH_LABEL')}
            <StrengthBar strengthColor={theme.colors.feedback.error} />
            {t('PASSWORD_STRENGTH_WEAK')}
          </PasswordStrengthContainer>
        );
      } if (password.length <= PasswordStrength.MEDIUM) {
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

  const handlePasswordChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (error) {
      setError('');
    }
    setPassword(event.currentTarget.value);
  };

  const onClickContinue = () => {
    if (password && passwordStrength !== PasswordStrength.WEAK) {
      handleContinue();
    } else {
      setError(t('PASSWORD_STRENGTH_ERROR'));
    }
  };

  return (
    <NewPasswordContainer>
      <PasswordInputLabel>{t('TEXT_INPUT_NEW_PASSWORD_LABEL')}</PasswordInputLabel>
      <PasswordInputContainer>
        <PasswordInput type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={handlePasswordChange} />
        <button type="button" onClick={handleTogglePasswordView} style={{ background: 'none' }}>
          <img src={isPasswordVisible ? Eye : EyeSlash} alt="show-password" height={24} />
        </button>
      </PasswordInputContainer>
      {error && (
        <ErrorMessage>
            {error}
        </ErrorMessage>
      )}
      {password.length > 0 ? renderStrengthBar() : null}
      <ButtonsContainer>
        <BackButton onClick={handleBack}>
          {t('BACK_BUTTON')}
        </BackButton>
        <ContinueButton onClick={onClickContinue}>
          {t('CONTINUE_BUTTON')}
        </ContinueButton>
      </ButtonsContainer>
    </NewPasswordContainer>
  );
}

export default NewPassword;
