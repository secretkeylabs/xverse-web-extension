import {
  type ExecuteOrderRequest,
  type PlaceOrderResponse,
  type PlaceStxOrderResponse,
  type PlaceUtxoOrderResponse,
} from '@secretkeylabs/xverse-core';

export type Side = 'from' | 'to';
type BaseOrderInfo = {
  providerCode: ExecuteOrderRequest['providerCode'];
};

export type OrderInfo = BaseOrderInfo & {
  order: PlaceOrderResponse | PlaceUtxoOrderResponse;
};

export type StxOrderInfo = BaseOrderInfo & {
  order: PlaceStxOrderResponse;
};
