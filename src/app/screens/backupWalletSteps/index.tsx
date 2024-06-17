import Dots from '@components/dots';
import { useWalletExistsContext } from '@components/guards/onboarding';
import PasswordInput from '@components/passwordInput';
import useSeedVault from '@hooks/useSeedVault';
import useWalletReducer from '@hooks/useWalletReducer';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SeedCheck from './seedCheck';
import VerifySeed from './verifySeed';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  paddingTop: props.theme.space.l,
}));

const SeedContainer = styled.div((props) => ({
  paddingTop: props.theme.spacing(21),
}));

const PasswordContainer = styled.div((props) => ({
  marginTop: props.theme.space.xxxl,
  marginBottom: props.theme.space.xxxl,
  display: 'flex',
  flex: 1,
}));

export default function BackupWalletSteps(): JSX.Element {
  const { t } = useTranslation('translation', { keyPrefix: 'CREATE_PASSWORD_SCREEN' });
  const [currentActiveIndex, setCurrentActiveIndex] = useState<number>(0);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const navigate = useNavigate();
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const seedVault = useSeedVault();
  const { createWallet } = useWalletReducer();
  const { disableWalletExistsGuard } = useWalletExistsContext();

  useEffect(() => {
    (async () => {
      try {
        const seed = await seedVault.getSeed();
        setSeedPhrase(seed);
      } catch (e) {
        navigate('/backup');
      }
    })();
    return () => {
      setSeedPhrase('');
    };
  }, []);

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
    if (confirmPassword === password) {
      disableWalletExistsGuard?.();
      const seed = await seedVault.getSeed();

      await chrome.storage.local.clear();
      await chrome.storage.session.clear();

      await seedVault.storeSeed(seed, password);

      await createWallet(); // TODO move this somwhere else
      navigate('/wallet-success/create', { replace: true });
    } else {
      setError(t('CONFIRM_PASSWORD_MATCH_ERROR'));
    }
  };

  const backupSteps = [
    <SeedContainer key="SEED_CHECK">
      <SeedCheck seedPhrase={seedPhrase} onContinue={handleSeedCheckContinue} />
    </SeedContainer>,
    <VerifySeed
      key="VERIFY_SEED"
      onBack={handleVerifySeedBack}
      onVerifySuccess={handleVerifySeedSuccess}
      seedPhrase={seedPhrase}
    />,
    <PasswordContainer key="CREATE_PASSWORD">
      <PasswordInput
        title={t('CREATE_PASSWORD_TITLE')}
        inputLabel={t('TEXT_INPUT_NEW_PASSWORD_LABEL')}
        enteredPassword={password}
        setEnteredPassword={setPassword}
        handleContinue={handleNewPasswordContinue}
        handleBack={handleNewPasswordBack}
        checkPasswordStrength
        autoFocus
      />
    </PasswordContainer>,
    <PasswordContainer key="CONFIRM_PASSWORD">
      <PasswordInput
        title={t('CONFIRM_PASSWORD_TITLE')}
        inputLabel={t('TEXT_INPUT_NEW_PASSWORD_LABEL')}
        enteredPassword={confirmPassword}
        setEnteredPassword={setConfirmPassword}
        handleContinue={handleConfirmPasswordContinue}
        handleBack={handleConfirmPasswordBack}
        passwordError={error}
        autoFocus
      />
    </PasswordContainer>,
  ];

  return (
    <Container>
      <Dots numDots={backupSteps.length} activeIndex={currentActiveIndex} />
      {backupSteps[currentActiveIndex]}
    </Container>
  );
}
