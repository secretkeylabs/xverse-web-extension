import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import useWalletSelector from '@hooks/useWalletSelector';
import { SignPsbtOptions } from 'sats-connect';

const useSignPsbtTx = () => {
  const { btcAddress, ordinalsAddress } = useWalletSelector();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('signPsbtRequest') ?? '';
  const request = decodeToken(requestToken) as any as SignPsbtOptions;
  const tabId = params.get('tabId') ?? '0';

  const approveBtcAddressRequest = () => {

  };

  const cancelAddressRequest = () => {

  };

  return {
    payload: request.payload,
    tabId,
    requestToken,
    approveBtcAddressRequest,
    cancelAddressRequest,
  };
};

export default useSignPsbtTx;
