import useDappRequest from '@hooks/useTransationRequest';
import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';
import ContractDeployRequest from '@components/transactionsRequests/ContractDeployTransaction';

function TransactionRequest() {
  const { payload } = useDappRequest();
  if (payload.txType === 'contract_call') return <ContractCallRequest request={payload} />;
  if (payload.txType === 'smart_contract') return <ContractDeployRequest request={payload} />;
}

export default TransactionRequest;
