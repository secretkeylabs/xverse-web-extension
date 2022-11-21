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
import RestoreWallet from '@screens/restoreWallet';
import ForgotPassword from '@screens/forgotPassword';
import BackupWalletSteps from '@screens/backupWalletSteps';
import Stacking from '@screens/stacking';
import NftDashboard from '@screens/nftDashboard';
import NftDetailScreen from '@screens/nftDetail';
import Setting from '@screens/settings';
import FiatCurrencyScreen from '@screens/settings/fiatCurrency';
import ChangePasswordScreen from '@screens/settings/changePassword';
import ChangeNetworkScreen from '@screens/settings/changeNetwork';
import BackupWalletScreen from '@screens/settings/backupWallet';
import SendNft from '@screens/sendNft';
import ConfirmNftTransaction from '@screens/confirmNftTransaction';

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
        path: 'manage-tokens',
        element: <ManageTokens />,
      },
      {
        path: 'account-list',
        element: <AccountList />,
      },
      {
        path: 'receive/:currency',
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
        path: 'nft-dashboard/nft-detail/:id/send-nft',
        element: <SendNft />,
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
      {
        path: 'restoreWallet',
        element: <RestoreWallet />,
      },
      {
        path: 'forgotPassword',
        element: <ForgotPassword />,
      },
      {
        path: 'backupWalletSteps',
        element: <BackupWalletSteps />,
      },
      {
        path: 'stacking',
        element: <Stacking />,
      },
      {
        path: 'nft-dashboard',
        element: <NftDashboard />,
      },
      {
        path: 'nft-dashboard/nft-detail/:id',
        element: <NftDetailScreen />,
      },
      {
        path: 'confirm-nft-tx/:id',
        element: <ConfirmNftTransaction />,
      },
      {
        path: 'settings',
        element: <Setting />,
      },
      {
        path: 'fiat-currency',
        element: <FiatCurrencyScreen />,
      },
      {
        path: 'change-password',
        element: <ChangePasswordScreen />,
      },
      {
        path: 'change-network',
        element: <ChangeNetworkScreen />,
      },
      {
        path: 'backup-wallet',
        element: <BackupWalletScreen />,
      },
    ],
  },
]);

export default router;
