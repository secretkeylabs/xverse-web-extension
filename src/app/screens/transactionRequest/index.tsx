import useDappRequest from '@hooks/useTransationRequest';
import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';

function TransactionRequest() {
  const { payload } = useDappRequest();
  return (
    payload.txType === 'contract_call' && <ContractCallRequest request={payload} />
  );
}

export default TransactionRequest;
