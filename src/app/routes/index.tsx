import { createHashRouter } from 'react-router-dom';
import Home from '@screens/home';
import Landing from '@screens/landing';
import Onboarding from '@screens/onboarding';
import ScreenContainer from '@components/screenContainer';
import LegalLinks from '@screens/legalLinks';
import ManageTokens from '@screens/manageTokens';
import AccountList from '@screens/accountList';
import Receive from '@screens/receive';
import ConfirmStxTransaction from '@screens/confirmStxTransaxtion';
import SendStxScreen from '@screens/sendStx';
import TransactionStatus from '@screens/transactionStatus';
import SendBtcScreen from '@screens/sendBtc';
import ConfirmBtcTransaction from '@screens/confrimBtcTransaction';
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
        path: 'manageTokens',
        element: <ManageTokens />,
      },
      {
        path: 'accountList',
        element: <AccountList />,
      },
      {
        path: 'receive',
        element: <Receive />,
      },
      {
        path: 'send-stx',
        element: <SendStxScreen />,
      },
      {
        path: 'send-btc',
        element: <SendBtcScreen />,
      },
      {
        path: 'confirm-stx-tx',
        element: <ConfirmStxTransaction />,
      },
      {
        path: 'confirm-btc-tx',
        element: <ConfirmBtcTransaction />,
      },
      {
        path: 'tx-status',
        element: <TransactionStatus />,
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
