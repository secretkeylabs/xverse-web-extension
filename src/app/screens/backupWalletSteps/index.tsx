import Steps from '@components/steps';
import ConfirmPassword from '@screens/createPassword/confirmPassword';
import NewPassword from '@screens/createPassword/newPassword';
import { StoreState } from '@stores/index';
import { storeEncryptedSeedAction } from '@stores/wallet/actions/actionCreators';
import { encryptSeedPhrase } from '@utils/encryptionUtils';
import { useState } from 'react';
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

export default function BackupWalletSteps(): JSX.Element {
  const [currentActiveIndex, setCurrentActiveIndex] = useState<number>(0);
  const [password, setPassword] = useState<string>('');
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
    const encryptedSeed = await encryptSeedPhrase(seedPhrase, password);
    dispatch(storeEncryptedSeedAction(encryptedSeed));
    navigate('/create-wallet-success');
  };

  const backupSteps = [
    <SeedCheck
      seedPhrase={seedPhrase}
      onContinue={handleSeedCheckContinue}
    />,
    <VerifySeed
      onBack={handleVerifySeedBack}
      onVerifySuccess={handleVerifySeedSuccess}
      seedPhrase={seedPhrase}
    />,
    <NewPassword
      handleBack={handleNewPasswordBack}
      password={password}
      setPassword={setPassword}
      handleContinue={handleNewPasswordContinue}
    />,
    <ConfirmPassword
      handleBack={handleConfirmPasswordBack}
      handleContinue={handleConfirmPasswordContinue}
      password={password}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
    />,
  ];

  return (
    <Container>
      <Steps data={backupSteps} activeIndex={currentActiveIndex} />
      {backupSteps[currentActiveIndex]}
    </Container>
  );
}
