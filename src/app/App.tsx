import React from 'react';
import { ThemeProvider } from 'styled-components';
import logo from '../assets/img/xverse_icon.png';
import Theme from '../theme';
import { GlobalStyle } from '../theme/global';
import Header from './components/header';
import './locales';

const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={Theme}>
        <div>
          <img src={logo} alt="logo" />
          <Header />
        </div>
      </ThemeProvider>
    </>
  );
};

export default App;
