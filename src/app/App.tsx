import { ThemeProvider } from 'styled-components';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import rootStore from '@stores/index';
import LoadingScreen from '@components/loadingScreen';
import { queryClient } from '@utils/query';
import { Toaster } from 'react-hot-toast';
import Theme from '../theme';
import GlobalStyle from '../theme/global';
import '../locales';
import router from './routes';

function App(): JSX.Element {
  return (
    <>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <Provider store={rootStore.store}>
          <PersistGate persistor={rootStore.persistedStore} loading={<LoadingScreen />}>
            <ThemeProvider theme={Theme}>
              <RouterProvider router={router} />
              <Toaster position="bottom-center" containerStyle={{ bottom: 80 }} />
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </>
  );
}

export default App;
