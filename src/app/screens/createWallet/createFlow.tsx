import CreatePassword from '@components/createPassword';
import Dots from '@components/dots';
import { useWalletExistsContext } from '@components/guards/onboarding';
import SeedBackup from '@components/seedBackup';
import useTabUnloadBlocker from '@hooks/useTabUnloadBlocker';
import useWalletReducer from '@hooks/useWalletReducer';
import { generateMnemonic } from '@secretkeylabs/xverse-core';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import VerifySeed from './verifySeed';

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  padding: `${props.theme.space.l} ${props.theme.space.m} 0`,
  overflowY: 'auto',
}));

const SeedContainer = styled.div((props) => ({
  paddingTop: props.theme.spacing(21),
}));

const PasswordContainer = styled.div((props) => ({
  display: 'flex',
  width: '100%',
  marginTop: props.theme.space.xs,
  flex: '1 0 auto',
}));

enum BackupStep {
  CREATE_PASSWORD,
  SEED_CHECK,
  VERIFY_SEED,
}

type Props = {
  skipBackup?: boolean;
};

export default function CreateFlow({ skipBackup }: Props): JSX.Element {
  const [currentActiveIndex, setCurrentActiveIndex] = useState<BackupStep>(
    BackupStep.CREATE_PASSWORD,
  );
  const mnemonic = useMemo(() => generateMnemonic(), []);
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const { disableWalletExistsGuard } = useWalletExistsContext();
  const { createWallet } = useWalletReducer();

  useTabUnloadBlocker();

  const handleConfirmPasswordContinue = async (validatedPassword: string) => {
    if (skipBackup) {
      disableWalletExistsGuard?.();

      // TODO multiwallet: allow user to select derivation type. Currently hard coded to 'account'
      await createWallet(validatedPassword, mnemonic, 'account', false);

      navigate('/wallet-success/create', { replace: true });
    } else {
      setPassword(validatedPassword);
      setCurrentActiveIndex(BackupStep.SEED_CHECK);
    }
  };

  const handleSeedCheckContinue = () => {
    setCurrentActiveIndex(BackupStep.VERIFY_SEED);
  };

  const handleVerifySeedBack = () => {
    setCurrentActiveIndex(BackupStep.SEED_CHECK);
  };

  const handleVerifySeedSuccess = async () => {
    disableWalletExistsGuard?.();

    // TODO multiwallet: allow user to select derivation type. Currently hard coded to 'account'
    await createWallet(password, mnemonic, 'account', true);

    navigate('/wallet-success/create', { replace: true });
  };

  const renderStep = () => {
    switch (currentActiveIndex) {
      case BackupStep.CREATE_PASSWORD:
        return (
          <PasswordContainer key="CREATE_PASSWORD">
            <CreatePassword handleContinue={handleConfirmPasswordContinue} checkPasswordStrength />
          </PasswordContainer>
        );
      case BackupStep.SEED_CHECK:
        return (
          <SeedContainer key="SEED_CHECK">
            <SeedBackup mnemonic={mnemonic} onContinue={handleSeedCheckContinue} />
          </SeedContainer>
        );
      case BackupStep.VERIFY_SEED:
        return (
          <VerifySeed
            key="VERIFY_SEED"
            mnemonic={mnemonic}
            onBack={handleVerifySeedBack}
            onVerifySuccess={handleVerifySeedSuccess}
          />
        );
      default:
        return null;
    }
  };
  return (
    <Container>
      <Dots numDots={3} activeIndex={currentActiveIndex} />
      {renderStep()}
    </Container>
  );
}
