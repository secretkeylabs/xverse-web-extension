import styled from 'styled-components';
import Header from '@components/header';
import logo from '@assets/img/xverse_icon.png';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

function Home(): JSX.Element {
  return (
    <AppContainer>
      <img src={logo} alt="logo" />
      <Header />
    </AppContainer>
  );
}

export default Home;
