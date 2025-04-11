import useXverseApi from '@hooks/apiClients/useXverseApi';
import {
  type PlaceUtxoOrderRequest,
  type PlaceUtxoOrderResponse,
} from '@secretkeylabs/xverse-core';
import { useState } from 'react';

const usePlaceUtxoOrder = () => {
  const [order, setOrder] = useState<PlaceUtxoOrderResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const xverseApiClient = useXverseApi();

  const placeUtxoOrder = async (request: PlaceUtxoOrderRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await xverseApiClient.swaps.placeUtxoOrder(request);
      setOrder(response);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return { order, loading, error, placeUtxoOrder };
};

export default usePlaceUtxoOrder;
