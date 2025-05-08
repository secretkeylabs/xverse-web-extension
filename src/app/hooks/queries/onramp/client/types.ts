// ===================================================
// Supported Currencies API Types
// ===================================================

interface CryptoCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  chainId: number;
  icon: string;
  networkDisplayName: string;
}

interface FiatCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  icon: string;
}

interface SupportedCurrenciesMessage {
  crypto: CryptoCurrency[];
  fiat: FiatCurrency[];
}

export interface SupportedCurrenciesResponse {
  message: SupportedCurrenciesMessage;
}

// ===================================================
// Payment Methods API Types
// ===================================================

type CurrencyStatus = 'SourceAndDestSupported' | string;

interface PaymentMethodDetails {
  currencyStatus: CurrencyStatus;
  limits: {
    aggregatedLimit: {
      min: number;
      max: number;
    };
    [provider: string]: {
      min: number;
      max: number;
    };
  };
}

export interface PaymentMethod {
  paymentTypeId: string;
  name: string;
  icon: string;
  details: PaymentMethodDetails;
}

export interface PaymentMethodsResponse {
  message: PaymentMethod[];
}

// ===================================================
// Get Defaults API Types
// ===================================================

interface DefaultConfiguration {
  amount: number;
  disableDeviceSpecificRecommendation: boolean;
  paymentMethod: string;
  provider: string;
  source: string;
  target: string;
}

interface RecommendedConfiguration extends DefaultConfiguration {
  country: string;
}

interface GetDefaultsMessage {
  recommended: RecommendedConfiguration;
  defaults: Record<string, DefaultConfiguration>;
}

export interface GetDefaultsResponse {
  message: GetDefaultsMessage;
}

// ===================================================
// Fetch Onramp Metadata API Types
// ===================================================

interface OnrampPngIcons {
  '32x32': string;
  '160x160': string;
}

interface OnrampIcons {
  svg: string;
  png: OnrampPngIcons;
}

interface OnrampMetadata {
  icon: string;
  displayName: string;
  id: string;
  icons: OnrampIcons;
}

export interface FetchOnrampMetadataResponse {
  message: OnrampMetadata[];
}

// ===================================================
// Fetch Buy Quotes API Types
// ===================================================

interface Limit {
  min: number;
  max: number;
}

interface QuotePaymentMethodDetails {
  currencyStatus: string; // e.g. "SourceAndDestSupported"
  limits: Record<string, Limit>;
}

interface QuotePaymentMethod {
  paymentTypeId: string;
  name: string;
  icon: string;
  details: QuotePaymentMethodDetails;
}

export interface QuoteError {
  type: string;
  errorId: number;
  message: string;
  name: string;
}

interface BuyQuoteBase {
  ramp: string;
  paymentMethod: string;
  quoteId: string;
}

export interface BuyQuoteSuccess extends BuyQuoteBase {
  rate: number;
  payout: number;
  networkFee?: number;
  transactionFee?: number;
  availablePaymentMethods?: QuotePaymentMethod[];
  recommendations?: string[];
}

export interface BuyQuoteError extends BuyQuoteBase {
  errors: QuoteError[];
}

export type BuyQuote = BuyQuoteSuccess | BuyQuoteError;

export type FetchBuyQuotesResponse = BuyQuote[];

export interface FetchBuyQuotesParams {
  fiat: string;
  crypto: string;
  amount: number;
  paymentMethod: string;
  uuid: string;
}

// ===================================================
// Initiate a Transaction API Types
// ===================================================

export interface InitiateTransactionParams {
  onramp: string;
  source: string;
  destination: string;
  amount: number;
  paymentMethod: string;
  walletAddress: string;
  network: string;
  uuid: string;
}

// ---------------------------------------------------
// Initiate a Transaction API Response Types
// ---------------------------------------------------

interface Wallet {
  address: string;
}

interface Theme {
  isDark: boolean;
  themeName: string;
  primaryColor: string;
  secondaryColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  cardColor: string;
}

interface PartnerData {
  redirectUrl: {
    success: string;
  };
}

interface SupportedParams {
  theme: Theme;
  partnerData: PartnerData;
}

interface SessionInformation {
  onramp: string;
  source: string;
  destination: string;
  amount: number;
  type: string;
  paymentMethod: string;
  network: string;
  uuid: string;
  originatingHost: string;
  partnerContext: string;
  wallet: Wallet;
  supportedParams: SupportedParams;
  country: string;
  expiringTime: number;
  sessionId: string;
}

interface TransactionParams {
  permissions: string;
}

interface TransactionInformation {
  url: string;
  type: string;
  transactionId: string;
  params: TransactionParams;
}

interface InitiateTransactionResponseMessage {
  validationInformation: boolean;
  status: string;
  sessionInformation: SessionInformation;
  transactionInformation: TransactionInformation;
}

export interface InitiateTransactionResponse {
  message: InitiateTransactionResponseMessage;
}
