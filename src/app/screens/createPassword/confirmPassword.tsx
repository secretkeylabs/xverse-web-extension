import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Eye from '@assets/img/createPassword/Eye.svg';
import EyeSlash from '@assets/img/createPassword/EyeSlash.svg';
import { useState } from 'react';

interface ConfirmPasswordProps {
  confirmPassword: string,
  password: string,
  setConfirmPassword: (confirmPassword: string) => void,
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

function ConfirmPassword(props: ConfirmPasswordProps): JSX.Element {
  const {
    confirmPassword,
    password,
    setConfirmPassword,
    handleContinue,
    handleBack,
  } = props;
  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleTogglePasswordView = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handlePasswordChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (error) {
      setError('');
    }
    setConfirmPassword(event.currentTarget.value);
  };

  const onClickContinue = () => {
    if (confirmPassword === password) {
      handleContinue();
    } else {
      setError(t('CONFIRM_PASSWORD_MATCH_ERROR'));
    }
  };

  return (
    <NewPasswordContainer>
      <PasswordInputLabel>{t('TEXT_INPUT_CONFIRM_PASSWORD_LABEL')}</PasswordInputLabel>
      <PasswordInputContainer>
        <PasswordInput type={isPasswordVisible ? 'text' : 'password'} value={confirmPassword} onChange={handlePasswordChange} />
        <button type="button" onClick={handleTogglePasswordView} style={{ background: 'none' }}>
          <img src={isPasswordVisible ? Eye : EyeSlash} alt="show-password" height={24} />
        </button>
      </PasswordInputContainer>
      {error && (
        <ErrorMessage>
            {error}
        </ErrorMessage>
      )}
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

export default ConfirmPassword;
