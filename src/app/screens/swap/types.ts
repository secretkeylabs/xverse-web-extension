import { type TokenImageProps } from '@components/tokenImage';
import {
  type ExecuteOrderRequest,
  type FungibleToken,
  type PlaceOrderResponse,
  type PlaceStxOrderResponse,
  type PlaceUtxoOrderResponse,
} from '@secretkeylabs/xverse-core';
import { Currency } from 'alex-sdk';

export type Side = 'from' | 'to';

export type SwapToken = {
  name: string;
  image: TokenImageProps;
  balance?: number;
  amount?: number;
  fiatAmount?: number;
};

type BaseOrderInfo = {
  providerCode: ExecuteOrderRequest['providerCode'];
};

export type OrderInfo = BaseOrderInfo & {
  order: PlaceOrderResponse | PlaceUtxoOrderResponse;
};

export type StxOrderInfo = BaseOrderInfo & {
  order: PlaceStxOrderResponse;
};
