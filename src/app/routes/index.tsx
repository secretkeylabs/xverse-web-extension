import { createHashRouter } from 'react-router-dom';
import Home from '@screens/home';
import Landing from '@screens/landing';
import Onboarding from '@screens/onboarding';
import ScreenContainer from '@components/screenContainer';
import LegalLinks from '@screens/legalLinks';
import ManageTokens from '@screens/manageTokens';
import AccountList from '@screens/accountList';
import Receive from '@screens/receive';
import ConfirmStxTransaction from '@screens/confirmStxTransaction';
import SendStxScreen from '@screens/sendStx';
import TransactionStatus from '@screens/transactionStatus';
import SendBtcScreen from '@screens/sendBtc';
import ConfirmBtcTransaction from '@screens/confirmBtcTransaction';
import BackupWallet from '@screens/backupWallet';
import CreateWalletSuccess from '@screens/createWalletSuccess';
import CreatePassword from '@screens/createPassword';
import AuthenticationRequest from '@screens/authenticationRequest';
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
import SendFtScreen from '@screens/sendFt';
import ConfirmFtTransaction from '@screens/confirmFtTransaction';
import Buy from '@screens/buy';
import SendNft from '@screens/sendNft';
import ConfirmNftTransaction from '@screens/confirmNftTransaction';
import CoinDashboard from '@screens/coinDashboard';
import ExtendedScreenContainer from '@components/extendedScreenContainer';
import SignatureRequest from '@screens/signatureRequest';
import TransactionRequest from '@screens/transactionRequest';
import ErrorBoundary from '@screens/error';
import OrdinalDetailScreen from '@screens/ordinalDetail';
import SendOrdinal from '@screens/sendOrdinal';
import ConfirmOrdinalTransaction from '@screens/confirmOrdinalTransaction';
import BtcSelectAddressScreen from '@screens/btcSelectAddressScreen';
import SignPsbtRequest from '@screens/signPsbtRequest';
import RestoreFunds from '@screens/restoreFunds';

const router = createHashRouter([
  {
    path: '/',
    element: <ScreenContainer />,
    errorElement: <ErrorBoundary />,
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
        path: 'send-ft',
        element: <SendFtScreen />,
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
        path: 'confirm-ft-tx',
        element: <ConfirmFtTransaction />,
      },
      {
        path: 'confirm-btc-tx',
        element: <ConfirmBtcTransaction />,
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
        path: 'wallet-success/:action',
        element: <CreateWalletSuccess />,
      },
      {
        path: 'transaction-request',
        element: (
          <AuthGuard>
            <TransactionRequest />
          </AuthGuard>
        ),
      },
      {
        path: 'authentication-request',
        element: (
          <AuthGuard>
            <AuthenticationRequest />
          </AuthGuard>
        ),
      },
      {
        path: 'btc-select-address-request',
        element: (
          <AuthGuard>
            <BtcSelectAddressScreen />
          </AuthGuard>
        ),
      },
      {
        path: 'psbt-signing-request',
        element: (
          <AuthGuard>
            <SignPsbtRequest />
          </AuthGuard>
        ),
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
        element: (
          <AuthGuard>
            <Stacking />
          </AuthGuard>
        ),
      },
      {
        path: 'settings',
        element: <Setting />,
      },
      {
        path: 'nft-dashboard/restore-funds',
        element: <RestoreFunds />,
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
      {
        path: 'tx-status',
        element: <TransactionStatus />,
      },
      {
        path: 'buy/:currency',
        element: <Buy />,
      },
      {
        path: 'coinDashboard/:coin',
        element: <CoinDashboard />,
      },
      {
        path: 'signature-request',
        element: (
          <AuthGuard>
            <SignatureRequest />
          </AuthGuard>
        ),
      },
      {
        path: 'send-ordinal',
        element: (
          <AuthGuard>
            <SendOrdinal />
          </AuthGuard>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <ExtendedScreenContainer />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'nft-dashboard',
        element: (
          <AuthGuard>
            <NftDashboard />
          </AuthGuard>
        ),
      },
      {
        path: 'nft-dashboard/nft-detail/:id',
        element: <NftDetailScreen />,
      },
      {
        path: 'nft-dashboard/ordinal-detail/:id/:txHash',
        element: <OrdinalDetailScreen />,
      },
      {
        path: 'nft-dashboard/nft-detail/:id/send-nft',
        element: <SendNft />,
      },
      {
        path: 'confirm-nft-tx/:id',
        element: <ConfirmNftTransaction />,
      },
      {
        path: 'confirm-ordinal-tx/:id',
        element: <ConfirmOrdinalTransaction />,
      },
      {
        path: 'nft-dashboard/ordinal-detail/:id/:txHash/send-ordinal',
        element: (
          <AuthGuard>
            <SendOrdinal />
          </AuthGuard>
        ),
      },
    ],
  },
]);

export default router;
