import { PersistedStorageGuard } from '@components/guards/persistedStorageGuard';
import { PermissionsProvider } from '@components/permissionsManager';
import StartupLoadingScreen from '@components/startupLoadingScreen';
import Toaster from '@components/toaster';
import TooltipProvider from '@components/tooltip/provider';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { setXClientVersion } from '@secretkeylabs/xverse-core';
import rootStore from '@stores/index';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@utils/query';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import styled, { ThemeProvider } from 'styled-components';
import Theme from '../theme';
import GlobalStyle from '../theme/global';
import SessionGuard from './components/guards/session';
import router from './routes';

declare const VERSION: string;

// set the X-Client-Version header for core api requests
setXClientVersion(VERSION);

// needed to keep the svg icon scale for toasts over multiple lines
const StyledIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const commonToastStyles = {
  ...Theme.typography.body_medium_m,
  position: 'relative' as const,
  bottom: Theme.space.xxxxl,
  borderRadius: Theme.radius(2),
  padding: Theme.space.s,
};

function App(): React.ReactNode {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={Theme}>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <Provider store={rootStore.store}>
              <PersistGate persistor={rootStore.persistor} loading={<StartupLoadingScreen />}>
                <PersistedStorageGuard>
                  <SessionGuard>
                    <PermissionsProvider>
                      <RouterProvider router={router} />
                      <Toaster
                        max={1}
                        position="bottom-center"
                        toastOptions={{
                          duration: 2000,
                          success: {
                            icon: (
                              <StyledIcon>
                                <CheckCircle size={20} weight="bold" />
                              </StyledIcon>
                            ),
                            style: {
                              ...commonToastStyles,
                              backgroundColor: Theme.colors.success_medium,
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
                              ...commonToastStyles,
                              backgroundColor: Theme.colors.danger_dark,
                              color: Theme.colors.white_0,
                            },
                          },
                          blank: {
                            style: {
                              ...commonToastStyles,
                              backgroundColor: Theme.colors.white_0,
                              color: Theme.colors.elevation0,
                            },
                          },
                        }}
                      />
                    </PermissionsProvider>
                  </SessionGuard>
                </PersistedStorageGuard>
              </PersistGate>
            </Provider>
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
