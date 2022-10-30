import { ThemeProvider } from 'styled-components';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from '@stores/index';
import LoadingScreen from '@components/loadingScreen';
import Theme from '../theme';
import GlobalStyle from '../theme/global';
import '../locales';
import router from './routes';

function App(): JSX.Element {
  const { store, persistedStore } = configureStore();
  const queryClient = new QueryClient();
  return (
    <>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate persistor={persistedStore} loading={<LoadingScreen />}>
            <ThemeProvider theme={Theme}>
              <RouterProvider router={router} />
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </>
  );
}

export default App;
