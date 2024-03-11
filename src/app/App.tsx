import LoadingScreen from '@components/loadingScreen';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import rootStore from '@stores/index';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@utils/query';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import styled, { ThemeProvider } from 'styled-components';
import '../locales';
import Theme from '../theme';
import GlobalStyle from '../theme/global';
import SessionGuard from './components/guards/session';
import './mixpanelSetup';
import router from './routes';

// needed to keep the svg icon scale for toasts over multiple lines
const StyledIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App(): JSX.Element {
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
                <Toaster
                  position="bottom-center"
                  containerStyle={{ bottom: 80 }}
                  toastOptions={{
                    success: {
                      icon: (
                        <StyledIcon>
                          <CheckCircle size={20} weight="bold" />
                        </StyledIcon>
                      ),
                      style: {
                        ...Theme.typography.body_medium_m,
                        backgroundColor: Theme.colors.success_medium,
                        borderRadius: Theme.radius(2),
                        padding: Theme.space.s,
                        color: Theme.colors.elevation0,
                      },
                    },
                    error: {
                      icon: (
                        <StyledIcon>
                          <XCircle size={20} weight="bold" />
                        </StyledIcon>
                      ),
                      style: {
                        ...Theme.typography.body_medium_m,
                        backgroundColor: Theme.colors.danger_dark,
                        borderRadius: Theme.radius(2),
                        padding: Theme.space.s,
                        color: Theme.colors.white_0,
                      },
                    },
                    blank: {
                      style: {
                        ...Theme.typography.body_medium_m,
                        backgroundColor: Theme.colors.white_0,
                        borderRadius: Theme.radius(2),
                        padding: Theme.space.s,
                        color: Theme.colors.elevation0,
                      },
                      duration: 2000,
                    },
                  }}
                />
              </ThemeProvider>
            </SessionGuard>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </>
  );
}

export default App;
