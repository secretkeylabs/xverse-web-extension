import useDappRequest from '@hooks/useTransationRequest';
import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';
import useWalletSelector from '@hooks/useWalletSelector';
import { useEffect, useState } from 'react';
import { StacksTransaction } from '@stacks/transactions';
import ContractDeployRequest from '@components/transactionsRequests/ContractDeployTransaction';
import useStxPendingTxData from '@hooks/useStxPendingTxData';
import { useNavigate } from 'react-router-dom';
import { Ring } from 'react-spinners-css';
import styled from 'styled-components';
import { createDeployContractRequest, getContractCallPromises, getTokenTransferRequest } from './helper';

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

function TransactionRequest() {
  const { payload } = useDappRequest();
  const navigate = useNavigate();
  const {
    stxAddress, network, stxPublicKey, feeMultipliers,
  } = useWalletSelector();
  const [unsignedTx, setUnsignedTx] = useState<StacksTransaction>();
  const [codeBody, setCodeBody] = useState(undefined);
  const [contractName, setContractName] = useState(undefined);
  const stxPendingTxData = useStxPendingTxData();

  useEffect(() => {
    (async () => {
      try {
        if (payload.txType === 'token_transfer') {
          const unsignedSendStxTx = await getTokenTransferRequest(
            payload.recipient,
            payload.amount,
            payload.memo!,
            stxPublicKey,
            feeMultipliers!,
            network,
            stxPendingTxData,
          );
          setUnsignedTx(unsignedSendStxTx);
          navigate('/confirm-stx-tx', {
            state: {
              unsignedTx: unsignedSendStxTx,
              sponosred: payload.sponsored,
              isBrowserTx: true,
            },
          });
        } else if (payload.txType === 'contract_call') {
          const {
            unSignedContractCall, contractInterface, coinsMetaData, showPostConditionMessage,
          } = await getContractCallPromises(payload, stxAddress, network, stxPublicKey);
          setUnsignedTx(unSignedContractCall);
        } else if (payload.txType === 'smart_contract') {
          const response = await createDeployContractRequest(payload, network, stxPublicKey, feeMultipliers!, stxAddress);
          setUnsignedTx(response.contractDeployTx);
          setCodeBody(response.codeBody);
          setContractName(response.contractName);
        }
      } catch (e: unknown) {
        console.log(e);
      }
    })();
  }, [stxAddress, network, stxPublicKey, payload]);

  if (!unsignedTx) {
    return (
      <LoaderContainer>
        <Ring color="white" size={50} />
      </LoaderContainer>
    );
  }

  if (payload.txType === 'contract_call'
    && unsignedTx) return <ContractCallRequest request={payload} unsignedTx={unsignedTx} />;
  if (payload.txType === 'smart_contract') return <ContractDeployRequest unsignedTx={unsignedTx!} codeBody={codeBody!} contractName={contractName!} sponsored={payload?.sponsored!} />;
}

export default TransactionRequest;
