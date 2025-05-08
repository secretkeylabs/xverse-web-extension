import axios from 'axios';

import { ONRAMPER_API_KEY } from '@utils/constants';

import type {
  FetchBuyQuotesParams,
  FetchBuyQuotesResponse,
  FetchOnrampMetadataResponse,
  GetDefaultsResponse,
  InitiateTransactionParams,
  InitiateTransactionResponse,
  PaymentMethodsResponse,
  SupportedCurrenciesResponse,
} from './types';

const onramperApi = axios.create({
  baseURL: 'https://api.onramper.com',
  headers: {
    Authorization: ONRAMPER_API_KEY,
  },
});

async function fetchSupportedCurrencies() {
  const response = await onramperApi.get<SupportedCurrenciesResponse>('/supported');
  return response.data;
}

async function fetchPaymentMethods(source: string, target: string) {
  const response = await onramperApi.get<PaymentMethodsResponse>(
    `/supported/payment-types/${source}`,
    { params: { destination: target } },
  );
  return response.data;
}

async function fetchDefaults() {
  const response = await onramperApi.get<GetDefaultsResponse>('/supported/defaults/all');
  return response.data;
}

async function fetchOnrampMetadata() {
  const response = await onramperApi.get<FetchOnrampMetadataResponse>('/supported/onramps/all');
  return response.data;
}

async function fetchBuyQuotes(params: FetchBuyQuotesParams) {
  const response = await onramperApi.get<FetchBuyQuotesResponse>(
    `/quotes/${params.fiat}/${params.crypto}`,
    {
      params: {
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        uuid: params.uuid,
      },
    },
  );
  return response.data;
}

async function initiateTransaction(params: InitiateTransactionParams) {
  const response = await onramperApi.post<InitiateTransactionResponse>('/checkout/intent', {
    onramp: params.onramp,
    source: params.source,
    destination: params.destination,
    amount: params.amount,
    paymentMethod: params.paymentMethod,
    type: 'buy',
    network: params.network,
    uuid: params.uuid,
    wallet: {
      address: params.walletAddress,
    },
    supportedParams: {
      partnerData: {
        redirectUrl: {
          success: null,
          failure: null,
        },
        offrampCashoutRedirectUrl: null,
      },
    },
  });
  return response.data;
}

export default {
  fetchSupportedCurrencies,
  fetchPaymentMethods,
  fetchDefaults,
  fetchOnrampMetadata,
  fetchBuyQuotes,
  initiateTransaction,
};
