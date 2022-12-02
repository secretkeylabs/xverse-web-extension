import { createContractCallPromises } from '@screens/transactionRequest/helper';

import { decodeToken } from 'jsontokens';
import { useLocation } from 'react-router-dom';
import useWalletSelector from './useWalletSelector';

const useDappRequest = async () => {
  const { network, stxAddress, stxPublicKey } = useWalletSelector();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestToken = params.get('request') ?? '';
  const request = decodeToken(requestToken);
  const [unSignedContractCall, contractInterface, coinsMetaData, showPostConditionMessage] = await createContractCallPromises(request.payload, stxAddress, network, stxPublicKey);
  return {
    payload: request.payload,
    unSignedContractCall,
    contractInterface,
    coinsMetaData,
    showPostConditionMessage,
  };
};

export default useDappRequest;
