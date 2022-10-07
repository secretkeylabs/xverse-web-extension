import { ThemeProvider } from 'styled-components';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from '@stores/index';
import Theme from '../theme';
import GlobalStyle from '../theme/global';
import '../locales';
import router from './routes';


function App(): JSX.Element {
  const store = configureStore();
  return (
    <>
      <GlobalStyle />
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <RouterProvider router={router} />



        </ThemeProvider>
      </Provider>
    </>
  );
}

export default App;
