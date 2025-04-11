import AuthGuard from '@components/guards/auth';
import { Outlet, type RouteObject } from 'react-router-dom';

import RequestsRoutes from '@common/utils/route-urls';
import { SingleTabGuard } from '@components/guards/singleTab';
import AccountList from '@screens/accountList';
import Buy from '@screens/buy';
import ChangeNetworkRequest from '@screens/changeNetworkRequest';
import CoinDashboard from '@screens/coinDashboard';
import ConfirmBrc20Transaction from '@screens/confirmBrc20Transaction';
import ConfirmFtTransaction from '@screens/confirmFtTransaction';
import ConfirmNftTransaction from '@screens/confirmNftTransaction';
import ConfirmStxTransaction from '@screens/confirmStxTransaction';
import AuthenticationRequest from '@screens/connect/authenticationRequest';
import BtcSelectAddressScreen from '@screens/connect/btcSelectAddressScreen';
import { ConnectionRequest } from '@screens/connect/connectionRequest';
import StxSelectAccountScreen from '@screens/connect/stxSelectAccountScreen';
import StxSelectAddressScreen from '@screens/connect/stxSelectAddressScreen';
import ConnectHardwareWallet from '@screens/connectHardwareWallet';
import CreateInscription from '@screens/createInscription';
import EtchRune from '@screens/etchRune';
import ExecuteBrc20Transaction from '@screens/executeBrc20Transaction';
import Explore from '@screens/explore';
import Home from '@screens/home';
import ImportKeystone from '@screens/keystone/importKeystoneAccount';
import LedgerAddStxAddress from '@screens/ledger/addStxAddress';
import ConfirmLedgerStxTransaction from '@screens/ledger/confirmLedgerStxTransaction';
import ImportLedger from '@screens/ledger/importLedgerAccount';
import VerifyLedger from '@screens/ledger/verifyLedgerAccountAddress';
import ManageTokens from '@screens/manageTokens';
import MintRune from '@screens/mintRune';
import NftCollection from '@screens/nftCollection';
import NftDashboard from '@screens/nftDashboard';
import NftDashboardHidden from '@screens/nftDashboard/hidden';
import SupportedRarities from '@screens/nftDashboard/supportedRarities';
import NftDetailScreen from '@screens/nftDetail';
import OrdinalDetailScreen from '@screens/ordinalDetail';
import OrdinalsCollection from '@screens/ordinalsCollection';
import RareSatsBundle from '@screens/rareSatsBundle';
import RareSatsDetailScreen from '@screens/rareSatsDetail/rareSatsDetail';
import Receive from '@screens/receive';
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
import AddressBook from '@screens/settings/addressBook';
import AddEditAddress from '@screens/settings/addressBook/addEditAddress';
import AdvancedSettings from '@screens/settings/advanced';
import PaymentAddressTypeSelector from '@screens/settings/advanced/paymentAddressTypeSelector';
import RecoverFunds from '@screens/settings/advanced/recoverFunds';
import RecoverOrdinals from '@screens/settings/advanced/recoverFunds/recoverOrdinals';
import RecoverRunes from '@screens/settings/advanced/recoverFunds/recoverRunes';
import ChangeNetworkScreen from '@screens/settings/changeNetwork';
import { ConnectedAppsAndPermissions } from '@screens/settings/connectedAppsAndPermissions';
import Preferences from '@screens/settings/preferences';
import FiatCurrencyScreen from '@screens/settings/preferences/fiatCurrency';
import LockCountdown from '@screens/settings/preferences/lockCountdown';
import PrivacyPreferencesScreen from '@screens/settings/preferences/privacyPreferences';
import Security from '@screens/settings/security';
import BackupWalletScreen from '@screens/settings/security/backupWallet';
import ChangePasswordScreen from '@screens/settings/security/changePassword';
import ResetWalletScreen from '@screens/settings/security/resetWallet';
import SignBatchPsbtRequest from '@screens/signBatchPsbtRequest';
import SignMessageRequest from '@screens/signMessageRequest';
import SignPsbtRequest from '@screens/signPsbtRequest';
import SignRuneDelistingMessage from '@screens/signRuneDelistingMessage';
import SignatureRequest from '@screens/signatureRequest';
import SpeedUpTransactionScreen from '@screens/speedUpTransaction';
import Stacking from '@screens/stacking';
import { StxSignTransactions } from '@screens/stxSignTransactions';
import SwapScreen from '@screens/swap';
import TransactionRequest from '@screens/transactionRequest';
import TransactionStatus from '@screens/transactionStatus';
import MultipleMarketplaceListingResult from '@screens/transactionStatus/multipleMarketplaceListingResult';
import TransferRunesRequest from '@screens/transferRunesRequest';
import UnlistRuneScreen from '@screens/unlistRune';
import UnlistRuneUtxoScreen from '@screens/unlistRuneUtxo';
import BtcSendRequest from 'app/screens/btcSendRequest';
import ListRuneScreen from 'app/screens/listRune';
import RoutePaths from './paths';

const authedRoutesAnimated: RouteObject = {
  path: '/',
  element: (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  ),
  children: [
    {
      index: true,
      element: <Home />,
    },
  ],
};

const authedRoutes: RouteObject = {
  path: '/',
  element: (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  ),
  children: [
    // all routes that require authentication should be placed here
    {
      path: 'import-ledger',
      element: (
        <SingleTabGuard guardName="importLedger">
          <ImportLedger />
        </SingleTabGuard>
      ),
    },
    {
      path: 'verify-ledger',
      element: (
        <SingleTabGuard guardName="verifyLedger">
          <VerifyLedger />
        </SingleTabGuard>
      ),
    },
    {
      path: 'add-stx-address-ledger',
      element: <LedgerAddStxAddress />,
    },
    {
      path: 'import-keystone',
      element: (
        <AuthGuard>
          <SingleTabGuard guardName="importKeystone">
            <ImportKeystone />
          </SingleTabGuard>
        </AuthGuard>
      ),
    },
  ],
};

const authedRoutesWithSidebar: RouteObject = {
  path: '/',
  element: (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  ),
  children: [
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
      element: <ConfirmBrc20Transaction />,
    },
    {
      path: 'execute-brc20-tx',
      element: <ExecuteBrc20Transaction />,
    },
    {
      path: 'confirm-ledger-stx-tx',
      element: <ConfirmLedgerStxTransaction />,
    },
    {
      path: RequestsRoutes.TransactionRequest,
      element: <TransactionRequest />,
    },
    {
      path: RequestsRoutes.StxSignTransactions,
      element: <StxSignTransactions />,
    },
    {
      path: 'authentication-request',
      element: <AuthenticationRequest />,
    },
    {
      path: RequestsRoutes.AddressRequest,
      element: <BtcSelectAddressScreen />,
    },
    {
      path: 'stx-select-address-request',
      element: <StxSelectAddressScreen />,
    },
    {
      path: 'stx-select-account-request',
      element: <StxSelectAccountScreen />,
    },
    {
      path: RequestsRoutes.SignBtcTx,
      element: <SignPsbtRequest />,
    },
    {
      path: RequestsRoutes.SignBatchBtcTx,
      element: <SignBatchPsbtRequest />,
    },
    {
      path: RequestsRoutes.RuneListingBatchSigning,
      element: <RuneListingBatchSigningScreen />,
    },
    {
      path: RequestsRoutes.SendBtcTx,
      element: <BtcSendRequest />,
    },
    {
      path: 'speed-up-tx/:id',
      element: <SpeedUpTransactionScreen />,
    },
    {
      path: 'create-inscription', // used by our legacy style inscriptions methods for the inscription service
      element: <CreateInscription />,
    },
    {
      path: 'create-repeat-inscriptions', // used by our legacy style inscriptions methods for the inscription service
      element: <CreateInscription />,
    },
    {
      path: 'stacking',
      element: <Stacking />,
    },
    {
      path: 'explore',
      element: <Explore />,
    },
    {
      path: RoutePaths.Settings,
      element: <Setting />,
    },
    {
      path: RoutePaths.About,
      element: <About />,
    },
    {
      path: RoutePaths.Preferences,
      element: <Preferences />,
    },
    {
      path: RoutePaths.Security,
      element: <Security />,
    },
    {
      path: RoutePaths.AddressBook,
      element: <AddressBook />,
    },
    {
      path: RoutePaths.AddAddress,
      element: <AddEditAddress mode="add" />,
    },
    {
      path: RoutePaths.EditAddress(':id'),
      element: <AddEditAddress mode="edit" />,
    },
    {
      path: RoutePaths.AdvancedSettings,
      element: <AdvancedSettings />,
    },
    {
      path: RoutePaths.PreferredAddress,
      element: <PaymentAddressTypeSelector />,
    },
    {
      path: RoutePaths.RecoverFunds,
      element: <RecoverFunds />,
    },
    {
      path: RoutePaths.RecoverOrdinals,
      element: <RecoverOrdinals />,
    },
    {
      path: RoutePaths.RecoverRunes,
      element: <RecoverRunes />,
    },
    {
      path: RoutePaths.FiatCurrency,
      element: <FiatCurrencyScreen />,
    },
    {
      path: RoutePaths.PrivacyPreferences,
      element: <PrivacyPreferencesScreen />,
    },
    {
      path: RoutePaths.ChangePassword,
      element: <ChangePasswordScreen />,
    },
    {
      path: RoutePaths.ResetWallet,
      element: <ResetWalletScreen />,
    },
    {
      path: RoutePaths.ChangeNetwork,
      element: <ChangeNetworkScreen />,
    },
    {
      path: RoutePaths.BackupWallet,
      element: <BackupWalletScreen />,
    },
    {
      path: RoutePaths.ConnectedAppsAndPermissions,
      element: <ConnectedAppsAndPermissions />,
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
      element: <SignatureRequest />,
    },
    {
      path: RequestsRoutes.SignMessageRequest,
      element: <SignMessageRequest />,
    },
    {
      path: RequestsRoutes.SignRuneDelistingMessage,
      element: <SignRuneDelistingMessage />,
    },
    {
      path: RoutePaths.SendOrdinal,
      element: <SendOrdinal />,
    },
    {
      path: RoutePaths.SendInscriptionsRequest,
      element: <SendInscriptionsRequest />,
    },
    {
      path: RoutePaths.TransferRunesRequest,
      element: <TransferRunesRequest />,
    },
    {
      path: RoutePaths.SendBrc20OneStep,
      element: <SendBrc20OneStepScreen />,
    },
    {
      path: RoutePaths.LockCountdown,
      element: <LockCountdown />,
    },
    {
      path: 'confirm-nft-tx/:id',
      element: <ConfirmNftTransaction />,
    },
    {
      path: RequestsRoutes.ConnectionRequest,
      element: <ConnectionRequest />,
    },
    {
      path: RequestsRoutes.MintRune,
      element: <MintRune />,
    },
    {
      path: RequestsRoutes.EtchRune,
      element: <EtchRune />,
    },
    {
      path: 'nft-dashboard',
      element: <NftDashboard />,
    },
    {
      path: RoutePaths.SendBtc,
      element: <SendBtcScreen />,
    },
    {
      path: RoutePaths.SendStx,
      element: <SendStxScreen />,
    },
    {
      path: RoutePaths.SendRune,
      element: <SendRuneScreen />,
    },
    {
      path: 'nft-dashboard/hidden',
      element: <NftDashboardHidden />,
    },
    {
      path: 'nft-dashboard/rare-sats-bundle',
      element: <RareSatsBundle />,
    },
    {
      path: 'nft-dashboard/ordinals-collection/:id/:from?',
      element: <OrdinalsCollection />,
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
      path: 'nft-dashboard/nft-collection/:id/:from?',
      element: <NftCollection />,
    },
    {
      path: 'nft-dashboard/ordinal-detail/:id/send-ordinal',
      element: <SendOrdinal />,
    },
    {
      path: 'nft-dashboard/supported-rarity-scale',
      element: <SupportedRarities />,
    },
    {
      path: 'connect-hardware-wallet',
      element: <ConnectHardwareWallet />,
    },
    {
      path: RequestsRoutes.ChangeNetworkRequest,
      element: <ChangeNetworkRequest />,
    },
  ],
};

export { authedRoutes, authedRoutesAnimated, authedRoutesWithSidebar };
