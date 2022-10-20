import { createHashRouter } from 'react-router-dom';
import Home from '@screens/home';
import Landing from '@screens/landing';
import Onboarding from '@screens/onboarding';
import ScreenContainer from '@components/screenContainer';
import LegalLinks from '@screens/legalLinks';
import BackupWallet from '@screens/backupWallet';
import CreateWalletSuccess from '@screens/createWalletSuccess';
import CreatePassword from '@screens/createPassword';
import TransactionRequest from '@screens/transactionRequest';
import AuthenticationRequest from '@screens/authenticationRequest';

const router = createHashRouter([
  {
    path: '/',
    element: <ScreenContainer />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'onboarding',
        element: <Onboarding />,
      },
      {
        path: 'home',
        element: <Home />,
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
        path: 'transaction-request',
        element: <TransactionRequest />,
      },
      {
        path: 'authentication-request',
        element: <AuthenticationRequest />,
      },
    ],
  },
]);

export default router;
