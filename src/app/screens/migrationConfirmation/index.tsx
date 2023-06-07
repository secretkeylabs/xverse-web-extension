import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ActionButton from '@components/button';

const Container = styled.div`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  flex-direction: column;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const OnBoardingContentContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
}));

const OnboardingTitle = styled.h1((props) => ({
  ...props.theme.body_bold_l,
  textAlign: 'center',
  marginBottom: props.theme.spacing(8),
}));

function MigrationConfirmation(): JSX.Element {
  const navigate = useNavigate();

  const handleConfirm = () => {
    // TODO: Add migration logic
  };

  return (
    <Container>
      <OnBoardingContentContainer>
        <OnboardingTitle>
          Your wallet data store needs to be updated in order to remain secure. Please make sure you have your seed phrase backed up securely before moving forward. 
        </OnboardingTitle>

        <ActionButton
          onPress={handleConfirm}
          text="Confirm"
        />
      </OnBoardingContentContainer>
    </Container>
  );
}

export default MigrationConfirmation;
