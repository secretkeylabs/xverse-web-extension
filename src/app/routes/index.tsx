import RequestsRoutes from '@common/utils/route-urls';
import ExtendedScreenContainer from '@components/extendedScreenContainer';
import AuthGuard from '@components/guards/auth';
import OnboardingGuard from '@components/guards/onboarding';
import { SingleTabGuard } from '@components/guards/singleTab';
import ScreenContainer from '@components/screenContainer';
import AccountList from '@screens/accountList';
import BackupWallet from '@screens/backupWallet';
import BackupWalletSteps from '@screens/backupWalletSteps';
import Buy from '@screens/buy';
import CoinDashboard from '@screens/coinDashboard';
import ConfirmBrc20Transaction from '@screens/confirmBrc20Transaction';
import ConfirmFtTransaction from '@screens/confirmFtTransaction';
import ConfirmNftTransaction from '@screens/confirmNftTransaction';
import ConfirmStxTransaction from '@screens/confirmStxTransaction';
import AuthenticationRequest from '@screens/connect/authenticationRequest';
import BtcSelectAddressScreen from '@screens/connect/btcSelectAddressScreen';
import StxSelectAccountScreen from '@screens/connect/stxSelectAccountScreen';
import StxSelectAddressScreen from '@screens/connect/stxSelectAddressScreen';
import { ConnectionRequest } from '@screens/connectionRequest';
import CreateInscription from '@screens/createInscription';
import CreatePassword from '@screens/createPassword';
import CreateWalletSuccess from '@screens/createWalletSuccess';
import ErrorBoundary from '@screens/error';
import EtchRune from '@screens/etchRune';
import ExecuteBrc20Transaction from '@screens/executeBrc20Transaction';
import Explore from '@screens/explore';
import ForgotPassword from '@screens/forgotPassword';
import HardwareWalletImport from '@screens/hardwareWalletImport';
import Home from '@screens/home';
import KeystoneConnect from '@screens/keystone/connect';
import Landing from '@screens/landing';
import LedgerAddStxAddress from '@screens/ledger/addStxAddress';
import ConfirmLedgerStxTransaction from '@screens/ledger/confirmLedgerStxTransaction';
import ImportLedger from '@screens/ledger/importLedgerAccount';
import VerifyLedger from '@screens/ledger/verifyLedgerAccountAddress';
import Legal from '@screens/legal';
import Login from '@screens/login';
import ManageTokens from '@screens/manageTokens';
import MintRune from '@screens/mintRune';
import NftCollection from '@screens/nftCollection';
import NftDashboard from '@screens/nftDashboard';
import Index from '@screens/nftDashboard/hidden';
import SupportedRarities from '@screens/nftDashboard/supportedRarities';
import NftDetailScreen from '@screens/nftDetail';
import OrdinalDetailScreen from '@screens/ordinalDetail';
import OrdinalsCollection from '@screens/ordinalsCollection';
import RareSatsBundle from '@screens/rareSatsBundle';
import RareSatsDetailScreen from '@screens/rareSatsDetail/rareSatsDetail';
import Receive from '@screens/receive';
import RestoreWallet from '@screens/restoreWallet';
import RuneListingBatchSigningScreen from '@screens/runeListingBatchSigning';
import SendBrc20OneStepScreen from '@screens/sendBrc20OneStep';
import SendBtcScreen from '@screens/sendBtc';
import SendInscriptionsRequest from '@screens/sendInscriptionsRequest';
import SendNft from '@screens/sendNft';
import SendOrdinal from '@screens/sendOrdinal';
import SendRuneScreen from '@screens/sendRune';
import SendStxScreen from '@screens/sendStx';
import Setting from '@screens/settings';
import About from '@screens/settings/about';
import AdvancedSettings from '@screens/settings/advanced';
import RestoreFunds from '@screens/settings/advanced/restoreFunds';
import RecoverRunes from '@screens/settings/advanced/restoreFunds/recoverRunes';
import RestoreOrdinals from '@screens/settings/advanced/restoreFunds/restoreOrdinals';
import ChangeNetworkScreen from '@screens/settings/changeNetwork';
import ConnectedAppsAndPermissionsScreen from '@screens/settings/connectedAppsAndPermissions';
import Preferences from '@screens/settings/preferences';
import FiatCurrencyScreen from '@screens/settings/preferences/fiatCurrency';
import LockCountdown from '@screens/settings/preferences/lockCountdown';
import PrivacyPreferencesScreen from '@screens/settings/preferences/privacyPreferences';
import Security from '@screens/settings/security';
import BackupWalletScreen from '@screens/settings/security/backupWallet';
import ChangePasswordScreen from '@screens/settings/security/changePassword';
import SignBatchPsbtRequest from '@screens/signBatchPsbtRequest';
import SignMessageRequest from '@screens/signMessageRequest';
import SignPsbtRequest from '@screens/signPsbtRequest';
import SignRuneDelistingMessage from '@screens/signRuneDelistingMessage';
import SignatureRequest from '@screens/signatureRequest';
import SpeedUpTransactionScreen from '@screens/speedUpTransaction';
import Stacking from '@screens/stacking';
import SwapScreen from '@screens/swap';
import TransactionRequest from '@screens/transactionRequest';
import TransactionStatus from '@screens/transactionStatus';
import MultipleMarketplaceListingResult from '@screens/transactionStatus/multipleMarketplaceListingResult';
import TransferRunesRequest from '@screens/transferRunesRequest';
import UnlistRuneScreen from '@screens/unlistRune';
import UnlistRuneUtxoScreen from '@screens/unlistRuneUtxo';
import WalletExists from '@screens/walletExists';
import BtcSendRequest from 'app/screens/btcSendRequest';
import ListRuneScreen from 'app/screens/listRune';
import { createHashRouter } from 'react-router-dom';
import RoutePaths from './paths';

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
        path: 'hardware-wallet-import',
        element: (
          <AuthGuard>
            <SingleTabGuard guardName="hardwareWalletImport">
              <HardwareWalletImport />
            </SingleTabGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'hardware-wallet-import/keystone',
        element: (
          <AuthGuard>
            <SingleTabGuard guardName="hardwareWalletImport">
              <KeystoneConnect />
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
        path: RoutePaths.AccountList,
        element: <AccountList />,
      },
      {
        path: 'receive/:currency',
        element: <Receive />,
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
        path: RoutePaths.ConfirmStacksTransaction,
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
        path: 'confirm-ledger-stx-tx',
        element: <ConfirmLedgerStxTransaction />,
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
        path: RequestsRoutes.TransactionRequest,
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
        path: RequestsRoutes.SignBatchBtcTx,
        element: (
          <AuthGuard>
            <SignBatchPsbtRequest />
          </AuthGuard>
        ),
      },
      {
        path: RequestsRoutes.RuneListingBatchSigning,
        element: (
          <AuthGuard>
            <RuneListingBatchSigningScreen />
          </AuthGuard>
        ),
      },
      {
        path: RequestsRoutes.SendBtcTx,
        element: (
          <AuthGuard>
            <BtcSendRequest />
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
        path: RoutePaths.Settings,
        element: (
          <AuthGuard>
            <Setting />
          </AuthGuard>
        ),
      },
      {
        path: RoutePaths.About,
        element: (
          <AuthGuard>
            <About />
          </AuthGuard>
        ),
      },
      {
        path: RoutePaths.Preferences,
        element: (
          <AuthGuard>
            <Preferences />
          </AuthGuard>
        ),
      },
      {
        path: RoutePaths.Security,
        element: (
          <AuthGuard>
            <Security />
          </AuthGuard>
        ),
      },
      {
        path: RoutePaths.AdvancedSettings,
        element: (
          <AuthGuard>
            <AdvancedSettings />
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
        path: RoutePaths.ConnectedAppsAndPermissions,
        element: <ConnectedAppsAndPermissionsScreen />,
      },
      {
        path: 'tx-status',
        element: <TransactionStatus />,
      },
      {
        path: 'multiple-marketplace-listing-result',
        element: <MultipleMarketplaceListingResult />,
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
        path: 'unlist-rune/:runeId/utxo',
        element: <UnlistRuneUtxoScreen />,
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
        path: RequestsRoutes.SignRuneDelistingMessage,
        element: (
          <AuthGuard>
            <SignRuneDelistingMessage />
          </AuthGuard>
        ),
      },
      {
        path: RoutePaths.SendOrdinal,
        element: (
          <AuthGuard>
            <SendOrdinal />
          </AuthGuard>
        ),
      },
      {
        path: RoutePaths.SendInscriptionsRequest,
        element: (
          <AuthGuard>
            <SendInscriptionsRequest />
          </AuthGuard>
        ),
      },
      {
        path: RoutePaths.TransferRunesRequest,
        element: (
          <AuthGuard>
            <TransferRunesRequest />
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
        path: RequestsRoutes.ConnectionRequest,
        element: (
          <AuthGuard>
            <ConnectionRequest />
          </AuthGuard>
        ),
      },
      // TODO can we move this into extended screen container?
      {
        path: RequestsRoutes.MintRune,
        element: (
          <AuthGuard>
            <MintRune />
          </AuthGuard>
        ),
      },
      // TODO can we move this into extended screen container?
      {
        path: RequestsRoutes.EtchRune,
        element: (
          <AuthGuard>
            <EtchRune />
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
        path: 'nft-dashboard/hidden',
        element: (
          <AuthGuard>
            <Index />
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
        path: 'nft-dashboard/ordinals-collection/:id/:from?',
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
        path: 'nft-dashboard/ordinal-detail/:id/:from?',
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
