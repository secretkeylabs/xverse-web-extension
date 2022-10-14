import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '@stores/index';
import { encryptSeedPhrase } from '@utils/encryptionUtils';
import { storeEncryptedSeedAction } from '@stores/wallet/actions/actionCreators';
import NewPassword from './newPassword';
import ConfirmPassword from './confirmPassword';

const Container = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: props.theme.spacing(8),
}));

const StepsContainer = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacing(10),
  justifyContent: 'center',
}));

const StepDot = styled.div((props) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: props.active
    ? props.theme.colors.action.classic
    : props.theme.colors.background.elevation3,
  marginRight: props.theme.spacing(4),
}));

function CreatePassword(): JSX.Element {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { seedPhrase } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));

  const handleContinuePasswordCreation = () => {
    setCurrentStepIndex(1);
  };

  const handleConfirmPassword = async () => {
    console.log(seedPhrase);
    try {
      const encryptedSeed = await encryptSeedPhrase(seedPhrase, password);
      dispatch(storeEncryptedSeedAction(encryptedSeed));
      navigate('/create-wallet-success');
    } catch (err) {
      console.log(err);
    }
  };

  const handleNewPasswordBack = () => {
    navigate('/backup');
  };

  const handleConfirmPasswordBack = () => {
    setCurrentStepIndex(0);
  };

  return (
    <Container>
      <StepsContainer>
        {Array(2)
          .fill(0)
          .map((view, index) => (
            <StepDot active={index === currentStepIndex} key={index.toString() + 1} />
          ))}
      </StepsContainer>
      {currentStepIndex === 0 ? (
        <NewPassword
          password={password}
          setPassword={setPassword}
          handleContinue={handleContinuePasswordCreation}
          handleBack={handleNewPasswordBack}
        />
      ) : (
        <ConfirmPassword
          password={password}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          handleContinue={handleConfirmPassword}
          handleBack={handleConfirmPasswordBack}
        />
      )}
    </Container>
  );
}

export default CreatePassword;
