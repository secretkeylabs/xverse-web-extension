import CreatePassword from '@components/createPassword';
import Dots from '@components/dots';
import { useWalletExistsContext } from '@components/guards/onboarding';
import useTabUnloadBlocker from '@hooks/useTabUnloadBlocker';
import useWalletReducer from '@hooks/useWalletReducer';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SeedCheck from './seedCheck';
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

type Props = {
  skipBackup?: boolean;
};

export default function CreateWallet({ skipBackup }: Props): JSX.Element {
  const [currentActiveIndex, setCurrentActiveIndex] = useState<number>(0);

  const navigate = useNavigate();

  const { disableWalletExistsGuard } = useWalletExistsContext();
  const { createWallet } = useWalletReducer();

  useTabUnloadBlocker();

  const handleConfirmPasswordContinue = async (validatedPassword: string) => {
    disableWalletExistsGuard?.();

    // TODO multiwallet: allow user to select derivation type. Currently hard coded to 'account'
    await createWallet(validatedPassword, 'account', true);

    if (skipBackup) {
      navigate('/wallet-success/create', { replace: true });
    } else {
      setCurrentActiveIndex(1);
    }
  };

  const handleSeedCheckContinue = () => {
    setCurrentActiveIndex(2);
  };

  const handleVerifySeedBack = () => {
    setCurrentActiveIndex(1);
  };

  const handleVerifySeedSuccess = () => {
    navigate('/wallet-success/create', { replace: true });
  };

  const backupSteps = [
    <PasswordContainer key="CREATE_PASSWORD">
      <CreatePassword handleContinue={handleConfirmPasswordContinue} checkPasswordStrength />
    </PasswordContainer>,
    <SeedContainer key="SEED_CHECK">
      <SeedCheck onContinue={handleSeedCheckContinue} />
    </SeedContainer>,
    <VerifySeed
      key="VERIFY_SEED"
      onBack={handleVerifySeedBack}
      onVerifySuccess={handleVerifySeedSuccess}
    />,
  ];

  return (
    <Container>
      <Dots numDots={backupSteps.length} activeIndex={currentActiveIndex} />
      {backupSteps[currentActiveIndex]}
    </Container>
  );
}
