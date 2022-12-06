import { TransactionPayload } from '@stacks/connect';
import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';

const useDappRequest = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('request') ?? '';
  const request = decodeToken(requestToken) as any;
  return {
    payload: request.payload,
  };
};

export default useDappRequest;
