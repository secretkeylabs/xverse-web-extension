import { ThemeProvider } from 'styled-components';
import { RouterProvider } from 'react-router-dom';
import Theme from '../theme';
import GlobalStyle from '../theme/global';
import '../locales';
import router from './routes';

function App(): JSX.Element {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={Theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  );
}

export default App;
