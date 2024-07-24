import useWalletSelector from '@hooks/useWalletSelector';
import {
  getXverseApiClient,
  type ExecuteOrderRequest,
  type ExecuteOrderResponse,
} from '@secretkeylabs/xverse-core';
import { useState } from 'react';

const useExecuteOrder = () => {
  const [order, setOrder] = useState<ExecuteOrderResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { network } = useWalletSelector();

  const xverseApiClient = getXverseApiClient(network.type);

  const executeOrder = async (request: ExecuteOrderRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await xverseApiClient.swaps.executeOrder(request);
      setOrder(response);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to execute order');
    } finally {
      setLoading(false);
    }
  };

  return { order, loading, error, executeOrder };
};

export default useExecuteOrder;
