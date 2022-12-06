import useDappRequest from '@hooks/useTransationRequest';
import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';
import useWalletSelector from '@hooks/useWalletSelector';
import { useEffect, useState } from 'react';
import { StacksTransaction } from '@stacks/transactions';
import ContractDeployRequest from '@components/transactionsRequests/ContractDeployTransaction';
import { getContractCallPromises } from './helper';
import { ContractFunction } from '@secretkeylabs/xverse-core/types/api/stacks/transaction';
import { Coin } from '@secretkeylabs/xverse-core';

function TransactionRequest() {
  const { payload } = useDappRequest();
  const { stxAddress, network, stxPublicKey } = useWalletSelector();
  const [unsignedTx, setUnsignedTx] = useState<StacksTransaction>();
  const [funcMetaData, setFuncMetaData] = useState<ContractFunction | undefined>(undefined);
  const [coinsMetaData, setCoinsMetaData] = useState<Coin[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { unSignedContractCall, contractInterface, coinsMetaData, showPostConditionMessage } =
          await getContractCallPromises(payload, stxAddress, network, stxPublicKey);
        setUnsignedTx(unSignedContractCall);
        setCoinsMetaData(coinsMetaData);
        const invokedFuncMetaData: ContractFunction | undefined =
          contractInterface?.functions?.find((func) => func.name === payload.functionName);
        if (invokedFuncMetaData) {
          setFuncMetaData(invokedFuncMetaData);
        }
      } catch (e: unknown) {}
    })();
  }, [stxAddress, network, stxPublicKey, payload]);

  if (payload.txType === 'contract_call' && unsignedTx)
    return (
      <ContractCallRequest
        request={payload}
        unsignedTx={unsignedTx}
        funcMetaData={funcMetaData}
        coinsMetaData={coinsMetaData}
      />
    );
  if (payload.txType === 'smart_contract') return <ContractDeployRequest request={payload} />;
}

export default TransactionRequest;
