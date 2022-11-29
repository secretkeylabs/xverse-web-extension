import styled from 'styled-components';
import PostCondition from '@components/postCondition';
import useDappRequest from '@hooks/useTransationRequest';
import ConfirmScreen from '@components/confirmScreen';
import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  height: '100%',
}));

function TransactionRequest() {
  const confirmCallback = () => {};
  const cancelCallback = () => {};
  const { payload } = useDappRequest();
  return (
    <ConfirmScreen
      onConfirm={confirmCallback}
      onCancel={cancelCallback}
      cancelText="cancel"
      confirmText="confirm"
      loading={false}
    >
      <MainContainer>
        {payload.txType === 'contract_call' && <ContractCallRequest request={payload} />}
        {/* <PostCondition postCondition={payload.postConditions} showMore={false} /> */}
      </MainContainer>
    </ConfirmScreen>
  );
}

export default TransactionRequest;
