import { createHashRouter } from 'react-router-dom';
import Home from '@screens/home';
import Landing from '@screens/landing';
import Onboarding from '@screens/onboarding';
import ScreenContainer from '@components/screenContainer';
import LegalLinks from '@screens/legalLinks';
import BackupWallet from '@screens/backupWallet';
import CreateWalletSuccess from '@screens/createWalletSuccess';
import CreatePassword from '@screens/createPassword';
import AuthGuard from '@components/guards/auth';
import Login from '@screens/login';

const router = createHashRouter([
  {
    path: '/',
    element: <ScreenContainer />,
    children: [
      {
        path: 'landing',
        element: <Landing />,
      },
      {
        path: 'onboarding',
        element: <Onboarding />,
      },
      {
        index: true,
        element: (
          <AuthGuard>
            <Home />
          </AuthGuard>
        ),
      },
      {
        path: 'legal',
        element: <LegalLinks />,
      },
      {
        path: 'backup',
        element: <BackupWallet />,
      },
      {
        path: 'create-password',
        element: <CreatePassword />,
      },
      {
        path: 'create-wallet-success',
        element: <CreateWalletSuccess />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
]);

export default router;
