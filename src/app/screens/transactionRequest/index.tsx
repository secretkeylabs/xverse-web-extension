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
import { ContractFunction } from '@secretkeylabs/xverse-core/types/api/stacks/transaction';
import { Coin, createDeployContractRequest } from '@secretkeylabs/xverse-core';
import { getContractCallPromises, getTokenTransferRequest } from './helper';

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

function TransactionRequest() {
  const {
    payload, tabId, requestToken,
  } = useDappRequest();
  const navigate = useNavigate();
  const {
    stxAddress, network, stxPublicKey, feeMultipliers,
  } = useWalletSelector();
  const [unsignedTx, setUnsignedTx] = useState<StacksTransaction>();
  const [funcMetaData, setFuncMetaData] = useState<ContractFunction | undefined>(undefined);
  const [coinsMetaData, setCoinsMetaData] = useState<Coin[] | null>(null);
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
              tabId,
              requestToken,
            },
          });
        } else if (payload.txType === 'contract_call') {
          const {
            unSignedContractCall,
            contractInterface,
            coinsMetaData,
            showPostConditionMessage,
          } = await getContractCallPromises(payload, stxAddress, network, stxPublicKey);
          setUnsignedTx(unSignedContractCall);
          setCoinsMetaData(coinsMetaData);
          const invokedFuncMetaData: ContractFunction | undefined = contractInterface?.functions?.find((func) => func.name === payload.functionName);
          if (invokedFuncMetaData) {
            setFuncMetaData(invokedFuncMetaData);
          }
        } else if (payload.txType === 'smart_contract') {
          const response = await createDeployContractRequest(
            payload,
            network,
            stxPublicKey,
            feeMultipliers!,
            stxAddress,
          );
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

  if (payload.txType === 'contract_call' && unsignedTx) {
    return (
      <ContractCallRequest
        request={payload}
        unsignedTx={unsignedTx}
        funcMetaData={funcMetaData}
        coinsMetaData={coinsMetaData}
        tabId={Number(tabId)}
        requestToken={requestToken}
      />
    );
  }
  if (payload.txType === 'smart_contract') {
    return (
      <ContractDeployRequest
        unsignedTx={unsignedTx!}
        codeBody={codeBody!}
        contractName={contractName!}
        sponsored={payload?.sponsored!}
        tabId={Number(tabId)}
        requestToken={requestToken}
      />
    );
  }
}

export default TransactionRequest;
