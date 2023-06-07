import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ActionButton from '@components/button';
import migrateCachedStorage from '@utils/migrate';
import WarningIcon from '@assets/img/Warning.svg';

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

const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 'auto',
  marginBottom: props.theme.spacing(20),
}));

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
  marginTop: 'auto',
}));

const SkipButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

function MigrationConfirmation(): JSX.Element {
  const navigate = useNavigate();

  const handleConfirm = async () => {
    await migrateCachedStorage();
    navigate('/');
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <Container>
      <OnBoardingContentContainer>
        <OnboardingTitle>
          Your wallet data store needs to be updated in order to remain secure. Please make sure you
          have your seed phrase backed up securely before moving forward.
        </OnboardingTitle>
        <ButtonsContainer>
          <SkipButtonContainer>
            <ActionButton text="Skip" onPress={handleSkip} warning src={WarningIcon} />
          </SkipButtonContainer>
          <ActionButton onPress={handleConfirm} text="Confirm" />
        </ButtonsContainer>
      </OnBoardingContentContainer>
    </Container>
  );
}

export default MigrationConfirmation;
