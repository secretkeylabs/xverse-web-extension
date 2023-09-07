import ExtendedScreenContainer from '@components/extendedScreenContainer';
import AuthGuard from '@components/guards/auth';
import OnboardingGuard from '@components/guards/onboarding';
import { SingleTabGuard } from '@components/guards/singleTab';
import ScreenContainer from '@components/screenContainer';
import AccountList from '@screens/accountList';
import AuthenticationRequest from '@screens/authenticationRequest';
import BackupWallet from '@screens/backupWallet';
import BackupWalletSteps from '@screens/backupWalletSteps';
import BtcSelectAddressScreen from '@screens/btcSelectAddressScreen';
import BtcSendScreen from '@screens/btcSendScreen';
import Buy from '@screens/buy';
import CoinDashboard from '@screens/coinDashboard';
import ConfirmBtcTransaction from '@screens/confirmBtcTransaction';
import ConfirmFtTransaction from '@screens/confirmFtTransaction';
import ConfirmInscriptionRequest from '@screens/confirmInscriptionRequest';
import ConfirmNftTransaction from '@screens/confirmNftTransaction';
import ConfirmOrdinalTransaction from '@screens/confirmOrdinalTransaction';
import ConfirmStxTransaction from '@screens/confirmStxTransaction';
import CreateInscription from '@screens/createInscription';
import CreatePassword from '@screens/createPassword';
import CreateWalletSuccess from '@screens/createWalletSuccess';
import ErrorBoundary from '@screens/error';
import ForgotPassword from '@screens/forgotPassword';
import Home from '@screens/home';
import Landing from '@screens/landing';
import ConfirmLedgerTransaction from '@screens/ledger/confirmLedgerTransaction';
import ImportLedger from '@screens/ledger/importLedgerAccount';
import VerifyLedger from '@screens/ledger/verifyLedgerAccountAddress';
import LegalLinks from '@screens/legalLinks';
import Login from '@screens/login';
import ManageTokens from '@screens/manageTokens';
import NftDashboard from '@screens/nftDashboard';
import NftDetailScreen from '@screens/nftDetail';
import Onboarding from '@screens/onboarding';
import OrdinalDetailScreen from '@screens/ordinalDetail';
import Receive from '@screens/receive';
import RestoreFunds from '@screens/restoreFunds';
import RestoreBtc from '@screens/restoreFunds/restoreBtc';
import RestoreOrdinals from '@screens/restoreFunds/restoreOrdinals';
import RestoreWallet from '@screens/restoreWallet';
import SendBrc20Screen from '@screens/sendBrc20';
import SendBtcScreen from '@screens/sendBtc';
import SendFtScreen from '@screens/sendFt';
import SendNft from '@screens/sendNft';
import SendOrdinal from '@screens/sendOrdinal';
import SendStxScreen from '@screens/sendStx';
import Setting from '@screens/settings';
import BackupWalletScreen from '@screens/settings/backupWallet';
import ChangeNetworkScreen from '@screens/settings/changeNetwork';
import ChangePasswordScreen from '@screens/settings/changePassword';
import FiatCurrencyScreen from '@screens/settings/fiatCurrency';
import LockCountdown from '@screens/settings/lockCountdown';
import SignPsbtRequest from '@screens/signPsbtRequest';
import SignatureRequest from '@screens/signatureRequest';
import Stacking from '@screens/stacking';
import SwapScreen from '@screens/swap';
import SwapConfirmScreen from '@screens/swap/swapConfirmation';
import TransactionRequest from '@screens/transactionRequest';
import TransactionStatus from '@screens/transactionStatus';
import WalletExists from '@screens/walletExists';
import { createHashRouter } from 'react-router-dom';
import LedgerAddStxAddress from '@screens/ledger/addStxAddress';

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
        element: (
          <OnboardingGuard>
            <Onboarding />
          </OnboardingGuard>
        ),
      },
      {
        path: 'import-ledger',
        element: (
          <AuthGuard>
            <SingleTabGuard guardName="importLedger">
              <ImportLedger />
            </SingleTabGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'verify-ledger',
        element: (
          <AuthGuard>
            <SingleTabGuard guardName="verifyLedger">
              <VerifyLedger />
            </SingleTabGuard>
          </AuthGuard>
        ),
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
        element: (
          <OnboardingGuard>
            <LegalLinks />
          </OnboardingGuard>
        ),
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
        path: 'add-stx-address-ledger',
        element: <LedgerAddStxAddress />,
      },
      {
        path: 'swap',
        element: <SwapScreen />,
      },
      {
        path: 'swap-confirm',
        element: <SwapConfirmScreen />,
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
        path: 'confirm-ledger-tx',
        element: <ConfirmLedgerTransaction />,
      },
      {
        path: 'backup',
        element: (
          <OnboardingGuard>
            <BackupWallet />
          </OnboardingGuard>
        ),
      },
      {
        path: 'create-password',
        element: (
          <OnboardingGuard>
            <CreatePassword />
          </OnboardingGuard>
        ),
      },
      {
        path: 'wallet-success/:action',
        element: <CreateWalletSuccess />,
      },
      {
        path: 'wallet-exists',
        element: <WalletExists />,
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
        path: 'btc-send-request',
        element: (
          <AuthGuard>
            <BtcSendScreen />
          </AuthGuard>
        ),
      },
      {
        path: 'create-inscription',
        element: (
          <AuthGuard>
            <CreateInscription />
          </AuthGuard>
        ),
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgotPassword',
        element: <ForgotPassword />,
      },
      {
        path: 'backupWalletSteps',
        element: (
          <OnboardingGuard>
            <BackupWalletSteps />
          </OnboardingGuard>
        ),
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
        path: 'restore-funds',
        element: <RestoreFunds />,
      },
      {
        path: 'recover-btc',
        element: <RestoreBtc />,
      },
      {
        path: 'recover-ordinals',
        element: <RestoreOrdinals />,
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
      {
        path: 'send-brc20',
        element: (
          <AuthGuard>
            <SendBrc20Screen />
          </AuthGuard>
        ),
      },
      {
        path: 'send-nft/:id',
        element: <SendNft />,
      },
      {
        path: 'confirm-inscription-request',
        element: (
          <AuthGuard>
            <ConfirmInscriptionRequest />
          </AuthGuard>
        ),
      },
      {
        path: 'lockCountdown',
        element: (
          <AuthGuard>
            <LockCountdown />
          </AuthGuard>
        ),
      },
      {
        path: 'confirm-nft-tx/:id',
        element: (
          <AuthGuard>
            <ConfirmNftTransaction />
          </AuthGuard>
        ),
      },
      {
        path: 'confirm-ordinal-tx/:id',
        element: (
          <AuthGuard>
            <ConfirmOrdinalTransaction />
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
        path: 'nft-dashboard/ordinal-detail',
        element: <OrdinalDetailScreen />,
      },
      {
        path: 'nft-dashboard/nft-detail/:id/send-nft',
        element: <SendNft />,
      },
      {
        path: 'nft-dashboard/ordinal-detail/send-ordinal',
        element: (
          <AuthGuard>
            <SendOrdinal />
          </AuthGuard>
        ),
      },
      {
        path: 'restoreWallet',
        element: (
          <OnboardingGuard>
            <RestoreWallet />
          </OnboardingGuard>
        ),
      },
    ],
  },
]);

export default router;
