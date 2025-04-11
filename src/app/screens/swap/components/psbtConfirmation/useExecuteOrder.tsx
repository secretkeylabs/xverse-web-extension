import useXverseApi from '@hooks/apiClients/useXverseApi';
import {
  type ExecuteOrderRequest,
  type ExecuteOrderResponse,
  type ExecuteStxOrderRequest,
} from '@secretkeylabs/xverse-core';
import { useState } from 'react';

const useExecuteOrder = () => {
  const [order, setOrder] = useState<ExecuteOrderResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const xverseApiClient = useXverseApi();

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

  const executeStxOrder = async (request: ExecuteStxOrderRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await xverseApiClient.swaps.executeStxOrder(request);
      setOrder(response);
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to execute order');
    } finally {
      setLoading(false);
    }
  };

  return { order, loading, error, executeOrder, executeStxOrder };
};

export default useExecuteOrder;
