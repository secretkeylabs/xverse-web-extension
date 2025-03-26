import logo from '@assets/img/xverse_logo.svg';
import ErrorDisplay from '@components/errorDisplay';
import rootStore from '@stores/index';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  backgroundColor: props.theme.colors.elevation0,
}));

function StartupLoadingScreen(): React.ReactNode {
  const [error, setError] = useState('');

  useEffect(() => {
    let currentError = error;
    const intervalId = setInterval(() => {
      if (!currentError && rootStore.rehydrateError.current) {
        setError(rootStore.rehydrateError.current);
        currentError = rootStore.rehydrateError.current;
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <Container>
      <img src={logo} width={100} alt="logo" />
    </Container>
  );
}

export default StartupLoadingScreen;
