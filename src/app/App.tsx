import LoadingScreen from '@components/loadingScreen';
import rootStore from '@stores/index';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@utils/query';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components';
import '../locales';
import { useEffect } from 'react';
import mixpanel from 'mixpanel-browser';
import { MIX_PANEL_TOKEN } from '@utils/constants';
import Theme from '../theme';
import GlobalStyle from '../theme/global';
import SessionGuard from './components/guards/session';
import router from './routes';

function App(): JSX.Element {
  useEffect(() => {
    if (!MIX_PANEL_TOKEN) {
      return;
    }

    mixpanel.init(MIX_PANEL_TOKEN, {
      debug: process.env.NODE_ENV === 'development',
      ip: false,
      persistence: 'localStorage',
    });
  }, []);

  return (
    <>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Provider store={rootStore.store}>
          <PersistGate persistor={rootStore.persistedStore} loading={<LoadingScreen />}>
            <SessionGuard>
              <ThemeProvider theme={Theme}>
                <RouterProvider router={router} />
                <Toaster position="bottom-center" containerStyle={{ bottom: 80 }} />
              </ThemeProvider>
            </SessionGuard>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </>
  );
}

export default App;
