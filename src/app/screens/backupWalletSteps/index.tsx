import PasswordInput from '@components/passwordInput';
import Steps from '@components/steps';
import { StoreState } from '@stores/index';
import { storeEncryptedSeedAction } from '@stores/wallet/actions/actionCreators';
import { encryptSeedPhrase } from '@utils/encryptionUtils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SeedCheck from './seedCheck';
import VerifySeed from './verifySeed';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  paddingTop: props.theme.spacing(12),
}));

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  height: '100%',
  marginBottom: props.theme.spacing(20),
}));

export default function BackupWalletSteps(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const [currentActiveIndex, setCurrentActiveIndex] = useState<number>(0);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { seedPhrase } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));

  const handleSeedCheckContinue = () => {
    setCurrentActiveIndex(1);
  };

  const handleVerifySeedBack = () => {
    setCurrentActiveIndex(0);
  };

  const handleVerifySeedSuccess = () => {
    setCurrentActiveIndex(2);
  };

  const handleNewPasswordBack = () => {
    setCurrentActiveIndex(1);
  };

  const handleConfirmPasswordBack = () => {
    setCurrentActiveIndex(2);
  };

  const handleNewPasswordContinue = () => {
    setCurrentActiveIndex(3);
  };

  const handleConfirmPasswordContinue = async () => {
    try {
      if (confirmPassword === password) {
        const encryptedSeed = await encryptSeedPhrase(seedPhrase, password);
        dispatch(storeEncryptedSeedAction(encryptedSeed));
        navigate('/create-wallet-success');
      }
    } catch (err) {
      setError(t('CONFIRM_PASSWORD_MATCH_ERROR'));
    }
  };

  const backupSteps = [
    <SeedCheck seedPhrase={seedPhrase} onContinue={handleSeedCheckContinue} />,
    <VerifySeed
      onBack={handleVerifySeedBack}
      onVerifySuccess={handleVerifySeedSuccess}
      seedPhrase={seedPhrase}
    />,
    <PasswordContainer>
      <PasswordInput
        title={t('CREATE_PASSWORD_TITLE')}
        inputLabel={t('TEXT_INPUT_NEW_PASSWORD_LABEL')}
        enteredPassword={password}
        setEnteredPassword={setPassword}
        handleContinue={handleNewPasswordContinue}
        handleBack={handleNewPasswordBack}
        checkPasswordStrength
      />
    </PasswordContainer>,
    <PasswordContainer>
      <PasswordInput
        title={t('CONFIRM_PASSWORD_TITLE')}
        inputLabel={t('TEXT_INPUT_CONFIRM_PASSWORD_LABEL')}
        enteredPassword={confirmPassword}
        setEnteredPassword={setConfirmPassword}
        handleContinue={handleConfirmPasswordContinue}
        handleBack={handleConfirmPasswordBack}
        passwordError={error}
      />
    </PasswordContainer>,
  ];

  return (
    <Container>
      <Steps data={backupSteps} activeIndex={currentActiveIndex} />
      {backupSteps[currentActiveIndex]}
    </Container>
  );
}
