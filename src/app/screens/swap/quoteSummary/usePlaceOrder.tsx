import useXverseApi from '@hooks/apiClients/useXverseApi';
import { type PlaceOrderRequest, type PlaceStxOrderRequest } from '@secretkeylabs/xverse-core';
import { useState } from 'react';

const usePlaceOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const xverseApiClient = useXverseApi();

  const placeOrder = async (request: PlaceOrderRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await xverseApiClient.swaps.placeOrder(request);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const placeStxOrder = async (request: PlaceStxOrderRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await xverseApiClient.swaps.placeStxOrder(request);

      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, placeOrder, placeStxOrder };
};

export default usePlaceOrder;
