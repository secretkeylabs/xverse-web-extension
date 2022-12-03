import useDappRequest from '@hooks/useTransationRequest';
import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';
import useWalletSelector from '@hooks/useWalletSelector';
import { useEffect, useState } from 'react';
import { StacksTransaction } from '@stacks/transactions';
import ContractDeployRequest from '@components/transactionsRequests/ContractDeployTransaction';
import { getContractCallPromises } from './helper';

function TransactionRequest() {
  const { payload } = useDappRequest();
  const { stxAddress, network, stxPublicKey } = useWalletSelector();
  const [unsignedTx, setUnsignedTx] = useState<StacksTransaction>();

  useEffect(() => {
    (async () => {
      try {
        const {
          unSignedContractCall, contractInterface, coinsMetaData, showPostConditionMessage,
        } = await getContractCallPromises(payload, stxAddress, network, stxPublicKey);
        setUnsignedTx(unSignedContractCall);
      } catch (e: unknown) {}
    })();
  }, [stxAddress, network, stxPublicKey, payload]);

  if (payload.txType === 'contract_call'
  && unsignedTx) return <ContractCallRequest request={payload} unsignedTx={unsignedTx} />;
  if (payload.txType === 'smart_contract') return <ContractDeployRequest request={payload} />;
}

export default TransactionRequest;
