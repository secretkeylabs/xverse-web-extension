import styled from 'styled-components';
import logo from '@assets/img/full_logo_vertical.svg';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: '#12151E',
});

function LoadingScreen(): JSX.Element {
  return (
    <Container>
      <img src={logo} width={100} alt="logo" />
    </Container>
  );
}

export default LoadingScreen;
