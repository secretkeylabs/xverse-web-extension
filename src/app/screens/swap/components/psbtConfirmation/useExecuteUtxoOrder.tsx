import useXverseApi from '@hooks/apiClients/useXverseApi';
import {
  type ExecuteUtxoOrderRequest,
  type ExecuteUtxoOrderResponse,
} from '@secretkeylabs/xverse-core';
import { useState } from 'react';

const useExecuteUtxoOrder = () => {
  const [order, setOrder] = useState<ExecuteUtxoOrderResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const xverseApiClient = useXverseApi();

  const executeUtxoOrder = async (request: ExecuteUtxoOrderRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await xverseApiClient.swaps.executeUtxoOrder(request);
      setOrder(response);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to execute order');
    } finally {
      setLoading(false);
    }
  };

  return { order, loading, error, executeUtxoOrder };
};

export default useExecuteUtxoOrder;
