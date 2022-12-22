import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';

const useDappRequest = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('request') ?? '';
  const request = decodeToken(requestToken) as any;
  const tabId = params.get('tabId') ?? '0';
  return {
    payload: request.payload,
    tabId,
    requestToken,
  };
};

export default useDappRequest;
