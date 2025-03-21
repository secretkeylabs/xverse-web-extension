import useXverseApi from '@hooks/apiClients/useXverseApi';
import { type GetQuotesRequest, type GetQuotesResponse } from '@secretkeylabs/xverse-core';
import { useState } from 'react';

const useGetQuotes = () => {
  const [quotes, setQuotes] = useState<GetQuotesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const xverseApiClient = useXverseApi();

  const fetchQuotes = async (request: GetQuotesRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await xverseApiClient.swaps.getQuotes(request);
      setQuotes(response);
    } catch (err) {
      setError('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  return { quotes, loading, error, fetchQuotes };
};

export default useGetQuotes;
