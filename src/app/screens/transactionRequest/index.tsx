import styled from 'styled-components';
import PostCondition from '@components/postCondition';
import useDappRequest from '@hooks/useTransationRequest';
import ConfirmScreen from '@components/confirmScreen';
import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';

function TransactionRequest() {
  const { payload } = useDappRequest();
  return (
    payload.txType === 'contract_call' && <ContractCallRequest request={payload} />
  );
}

export default TransactionRequest;
