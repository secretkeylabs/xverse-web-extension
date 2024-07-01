import RequestsRoutes from '@common/utils/route-urls';
import ExtendedScreenContainer from '@components/extendedScreenContainer';
import AuthGuard from '@components/guards/auth';
import OnboardingGuard from '@components/guards/onboarding';
import { SingleTabGuard } from '@components/guards/singleTab';
import ScreenContainer from '@components/screenContainer';
import AccountList from '@screens/accountList';
import BackupWallet from '@screens/backupWallet';
import BackupWalletSteps from '@screens/backupWalletSteps';
import BtcSendScreen from '@screens/btcSendScreen';
import Buy from '@screens/buy';
import CoinDashboard from '@screens/coinDashboard';
import ConfirmBrc20Transaction from '@screens/confirmBrc20Transaction';
import ConfirmBtcTransaction from '@screens/confirmBtcTransaction';
import ConfirmFtTransaction from '@screens/confirmFtTransaction';
import ConfirmInscriptionRequest from '@screens/confirmInscriptionRequest';
import ConfirmNftTransaction from '@screens/confirmNftTransaction';
import ConfirmOrdinalTransaction from '@screens/confirmOrdinalTransaction';
import ConfirmStxTransaction from '@screens/confirmStxTransaction';
import AuthenticationRequest from '@screens/connect/authenticationRequest';
import BtcSelectAddressScreen from '@screens/connect/btcSelectAddressScreen';
import StxSelectAccountScreen from '@screens/connect/stxSelectAccountScreen';
import StxSelectAddressScreen from '@screens/connect/stxSelectAddressScreen';
import CreateInscription from '@screens/createInscription';
import CreatePassword from '@screens/createPassword';
import CreateWalletSuccess from '@screens/createWalletSuccess';
import ErrorBoundary from '@screens/error';
import ExecuteBrc20Transaction from '@screens/executeBrc20Transaction';
import Explore from '@screens/explore';
import ForgotPassword from '@screens/forgotPassword';
import Home from '@screens/home';
import Landing from '@screens/landing';
import LedgerAddStxAddress from '@screens/ledger/addStxAddress';
import ConfirmLedgerTransaction from '@screens/ledger/confirmLedgerTransaction';
import ImportLedger from '@screens/ledger/importLedgerAccount';
import VerifyLedger from '@screens/ledger/verifyLedgerAccountAddress';
import Legal from '@screens/legal';
import Login from '@screens/login';
import ManageTokens from '@screens/manageTokens';
import NftCollection from '@screens/nftCollection';
import NftDashboard from '@screens/nftDashboard';
import SupportedRarities from '@screens/nftDashboard/supportedRarities';
import NftDetailScreen from '@screens/nftDetail';
import OrdinalDetailScreen from '@screens/ordinalDetail';
import OrdinalsCollection from '@screens/ordinalsCollection';
import RareSatsBundle from '@screens/rareSatsBundle';
import RareSatsDetailScreen from '@screens/rareSatsDetail/rareSatsDetail';
import Receive from '@screens/receive';
import RestoreFunds from '@screens/restoreFunds';
import RecoverRunes from '@screens/restoreFunds/recoverRunes';
import RestoreOrdinals from '@screens/restoreFunds/restoreOrdinals';
import RestoreWallet from '@screens/restoreWallet';
import SendBrc20OneStepScreen from '@screens/sendBrc20OneStep';
import SendBtcScreen from '@screens/sendBtc';
import SendSip10Screen from '@screens/sendFt';
import SendNft from '@screens/sendNft';
import SendOrdinal from '@screens/sendOrdinal';
import SendRareSat from '@screens/sendRareSat';
import SendRuneScreen from '@screens/sendRune';
import SendStxScreen from '@screens/sendStx';
import Setting from '@screens/settings';
import BackupWalletScreen from '@screens/settings/backupWallet';
import ChangeNetworkScreen from '@screens/settings/changeNetwork';
import ChangePasswordScreen from '@screens/settings/changePassword';
import FiatCurrencyScreen from '@screens/settings/fiatCurrency';
import LockCountdown from '@screens/settings/lockCountdown';
import PrivacyPreferencesScreen from '@screens/settings/privacyPreferences';
import SignBatchPsbtRequest from '@screens/signBatchPsbtRequest';
import SignMessageRequest from '@screens/signMessageRequest';
import SignMessageRequestInApp from '@screens/signMessageRequestInApp';
import SignPsbtRequest from '@screens/signPsbtRequest';
import SignatureRequest from '@screens/signatureRequest';
import SpeedUpTransactionScreen from '@screens/speedUpTransaction';
import Stacking from '@screens/stacking';
import SwapScreen from '@screens/swap';
import SwapConfirmScreen from '@screens/swap/swapConfirmation';
import TransactionRequest from '@screens/transactionRequest';
import TransactionStatus from '@screens/transactionStatus';
import UnlistRuneScreen from '@screens/unlistRune';
import WalletExists from '@screens/walletExists';
import ListRuneScreen from 'app/screens/listRune';
import { createHashRouter } from 'react-router-dom';

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
            <Legal />
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
        path: 'send-sip10',
        element: <SendSip10Screen />,
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
        path: 'confirm-brc20-tx',
        element: (
          <AuthGuard>
            <ConfirmBrc20Transaction />
          </AuthGuard>
        ),
      },
      {
        path: 'execute-brc20-tx',
        element: (
          <AuthGuard>
            <ExecuteBrc20Transaction />
          </AuthGuard>
        ),
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
        path: RequestsRoutes.AddressRequest,
        element: (
          <AuthGuard>
            <BtcSelectAddressScreen />
          </AuthGuard>
        ),
      },
      {
        path: 'stx-select-address-request',
        element: (
          <AuthGuard>
            <StxSelectAddressScreen />
          </AuthGuard>
        ),
      },
      {
        path: 'stx-select-account-request',
        element: (
          <AuthGuard>
            <StxSelectAccountScreen />
          </AuthGuard>
        ),
      },
      {
        path: RequestsRoutes.SignBtcTx,
        element: (
          <AuthGuard>
            <SignPsbtRequest />
          </AuthGuard>
        ),
      },
      {
        path: 'batch-psbt-signing-request',
        element: (
          <AuthGuard>
            <SignBatchPsbtRequest />
          </AuthGuard>
        ),
      },
      {
        path: RequestsRoutes.SendBtcTx,
        element: (
          <AuthGuard>
            <BtcSendScreen />
          </AuthGuard>
        ),
      },
      {
        path: 'speed-up-tx/:id',
        element: <SpeedUpTransactionScreen />,
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
        path: 'create-repeat-inscriptions',
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
        path: 'explore',
        element: (
          <AuthGuard>
            <Explore />
          </AuthGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <AuthGuard>
            <Setting />
          </AuthGuard>
        ),
      },
      {
        path: 'restore-funds',
        element: <RestoreFunds />,
      },
      {
        path: 'restore-ordinals',
        element: <RestoreOrdinals />,
      },
      {
        path: 'recover-runes',
        element: <RecoverRunes />,
      },
      {
        path: 'fiat-currency',
        element: <FiatCurrencyScreen />,
      },
      {
        path: 'privacy-preferences',
        element: <PrivacyPreferencesScreen />,
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
        path: 'list-rune/:runeId',
        element: <ListRuneScreen />,
      },
      {
        path: 'unlist-rune/:runeId',
        element: <UnlistRuneScreen />,
      },
      {
        path: 'coinDashboard/:currency',
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
        path: RequestsRoutes.SignMessageRequest,
        element: (
          <AuthGuard>
            <SignMessageRequest />
          </AuthGuard>
        ),
      },
      {
        path: RequestsRoutes.SignMessageRequestInApp,
        element: (
          <AuthGuard>
            <SignMessageRequestInApp />
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
        path: 'send-brc20-one-step',
        element: (
          <AuthGuard>
            <SendBrc20OneStepScreen />
          </AuthGuard>
        ),
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
    ],
  },
  {
    path: '/',
    element: <ExtendedScreenContainer />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'send-btc',
        element: <SendBtcScreen />,
      },
      {
        path: 'send-stx',
        element: <SendStxScreen />,
      },
      {
        path: 'confirm-btc-tx',
        element: <ConfirmBtcTransaction />,
      },
      {
        path: 'send-rune',
        element: <SendRuneScreen />,
      },
      {
        path: 'nft-dashboard',
        element: (
          <AuthGuard>
            <NftDashboard />
          </AuthGuard>
        ),
      },
      {
        path: 'nft-dashboard/rare-sats-bundle',
        element: (
          <AuthGuard>
            <RareSatsBundle />
          </AuthGuard>
        ),
      },
      {
        path: 'nft-dashboard/ordinals-collection/:id',
        element: (
          <AuthGuard>
            <OrdinalsCollection />
          </AuthGuard>
        ),
      },
      {
        path: 'nft-dashboard/nft-detail/:id',
        element: <NftDetailScreen />,
      },
      {
        path: 'nft-dashboard/ordinal-detail/:id',
        element: <OrdinalDetailScreen />,
      },
      {
        path: 'nft-dashboard/rare-sats-detail',
        element: <RareSatsDetailScreen />,
      },
      {
        path: 'nft-dashboard/nft-detail/:id/send-nft',
        element: <SendNft />,
      },
      {
        path: 'nft-dashboard/nft-collection/:id',
        element: (
          <AuthGuard>
            <NftCollection />
          </AuthGuard>
        ),
      },
      {
        path: 'nft-dashboard/ordinal-detail/:id/send-ordinal',
        element: (
          <AuthGuard>
            <SendOrdinal />
          </AuthGuard>
        ),
      },
      {
        path: 'nft-dashboard/send-rare-sat',
        element: (
          <AuthGuard>
            <SendRareSat />
          </AuthGuard>
        ),
      },
      {
        path: 'nft-dashboard/confirm-ordinal-tx/:id',
        element: (
          <AuthGuard>
            <ConfirmOrdinalTransaction />
          </AuthGuard>
        ),
      },
      {
        path: 'nft-dashboard/supported-rarity-scale',
        element: <SupportedRarities />,
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
