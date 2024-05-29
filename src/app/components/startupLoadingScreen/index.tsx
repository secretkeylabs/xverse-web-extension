import logo from '@assets/img/xverse_logo.svg';
import rootStore from '@stores/index';
import InputFeedback from '@ui-library/inputFeedback';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  backgroundColor: '#12151E',
});

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

  return (
    <Container>
      <img src={logo} width={100} alt="logo" />
      <br />
      {error && <InputFeedback message={error} variant="danger" />}
    </Container>
  );
}

export default StartupLoadingScreen;
