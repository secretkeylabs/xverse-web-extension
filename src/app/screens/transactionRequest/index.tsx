import useDappRequest from '@hooks/useTransationRequest';
import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';
import { getContractCallPromises } from './helper';
import useWalletSelector from '@hooks/useWalletSelector';
import { useEffect, useState } from 'react';
import { StacksTransaction } from '@stacks/transactions';

function TransactionRequest() {
  const { payload } = useDappRequest();
  const { stxAddress, network, stxPublicKey } = useWalletSelector();
  const [unsignedTx, setUnsignedTx] = useState<StacksTransaction>();

  useEffect(() => {
    (async () => {
      try {
        const { unSignedContractCall, contractInterface, coinsMetaData, showPostConditionMessage } =
          await getContractCallPromises(payload, stxAddress, network, stxPublicKey);
        setUnsignedTx(unSignedContractCall);
      } catch (e: unknown) {}
    })();
  }, [stxAddress, network, stxPublicKey, payload]);

  return (
    payload.txType === 'contract_call' &&
    unsignedTx && <ContractCallRequest request={payload} unsignedTx={unsignedTx} />
  );
}

export default TransactionRequest;
