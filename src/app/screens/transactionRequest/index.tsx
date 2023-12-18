import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';
import ContractDeployRequest from '@components/transactionsRequests/ContractDeployTransaction';
import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useNetworkSelector from '@hooks/useNetwork';
import useDappRequest from '@hooks/useTransationRequest';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  Coin,
  ContractFunction,
  createDeployContractRequest,
  extractFromPayload,
} from '@secretkeylabs/xverse-core';
import { StacksTransaction } from '@stacks/transactions';
import { getNetworkType, isHardwareAccount } from '@utils/helper';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';
import { getContractCallPromises, getTokenTransferRequest } from './helper';

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

function TransactionRequest() {
  const { payload, tabId, requestToken } = useDappRequest();
  const navigate = useNavigate();
  const { stxAddress, network, stxPublicKey, feeMultipliers, accountsList, selectedAccount } =
    useWalletSelector();
  const selectedNetwork = useNetworkSelector();
  const { switchAccount } = useWalletReducer();
  const [unsignedTx, setUnsignedTx] = useState<StacksTransaction>();
  const [funcMetaData, setFuncMetaData] = useState<ContractFunction | undefined>(undefined);
  const [coinsMetaData, setCoinsMetaData] = useState<Coin[] | null>(null);
  const [codeBody, setCodeBody] = useState(undefined);
  const [contractName, setContractName] = useState(undefined);
  const stxPendingTxData = useStxPendingTxData();
  const [hasSwitchedAccount, setHasSwitchedAccount] = useState(false);
  const [attachment, setAttachment] = useState<Buffer | undefined>(undefined);

  const handleTokenTransferRequest = async () => {
    const unsignedSendStxTx = await getTokenTransferRequest(
      payload.recipient,
      payload.amount,
      payload.memo!,
      stxPublicKey,
      feeMultipliers!,
      selectedNetwork,
      stxPendingTxData.data,
    );
    setUnsignedTx(unsignedSendStxTx);
    navigate('/confirm-stx-tx', {
      state: {
        unsignedTx: unsignedSendStxTx.serialize().toString('hex'),
        sponosred: payload.sponsored,
        isBrowserTx: true,
        tabId,
        requestToken,
      },
    });
  };

  const handleContractCallRequest = async () => {
    const {
      unSignedContractCall,
      contractInterface,
      coinsMetaData: coinMeta,
    } = await getContractCallPromises(payload, stxAddress, selectedNetwork, stxPublicKey);
    setUnsignedTx(unSignedContractCall);
    setCoinsMetaData(coinMeta);
    const invokedFuncMetaData: ContractFunction | undefined = contractInterface?.functions?.find(
      (func) => func.name === payload.functionName,
    );
    const txAttachment = payload.attachment ?? undefined;
    if (txAttachment) setAttachment(txAttachment);
    if (invokedFuncMetaData) {
      setFuncMetaData(invokedFuncMetaData);
      const { funcArgs } = extractFromPayload(payload);
      if (invokedFuncMetaData?.args.length !== funcArgs.length) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'STX',
            error: 'Contract function call missing arguments',
            browserTx: true,
          },
        });
      }
    }
  };

  const handleContractDeployRequest = async () => {
    const response = await createDeployContractRequest(
      payload,
      selectedNetwork,
      stxPublicKey,
      feeMultipliers!,
      stxAddress,
    );
    setUnsignedTx(response.contractDeployTx);
    setCodeBody(response.codeBody);
    setContractName(response.contractName);
  };

  const switchAccountBasedOnRequest = () => {
    if (getNetworkType(payload.network) !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error:
            'There’s a mismatch between your active network and the network you’re logged with.',
          browserTx: true,
        },
      });
      return;
    }
    if (payload.stxAddress !== selectedAccount?.stxAddress && !isHardwareAccount(selectedAccount)) {
      const account = accountsList.find((acc) => acc.stxAddress === payload.stxAddress);
      if (account) {
        switchAccount(account);
      } else {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'STX',
            error:
              'There’s a mismatch between your active  address and the address you’re logged with.',
            browserTx: true,
          },
        });
      }
    }
    setHasSwitchedAccount(true);
  };

  const createRequestTx = async () => {
    try {
      if (hasSwitchedAccount) {
        if (payload.txType === 'token_transfer') {
          await handleTokenTransferRequest();
        } else if (payload.txType === 'contract_call') {
          await handleContractCallRequest();
        } else if (payload.txType === 'smart_contract') {
          await handleContractDeployRequest();
        }
      }
    } catch (e: unknown) {
      console.log(e);
    }
  };

  useEffect(() => {
    switchAccountBasedOnRequest();
    createRequestTx();
  }, [hasSwitchedAccount]);

  return (
    <>
      {!unsignedTx ? (
        <LoaderContainer>
          <MoonLoader color="white" size={50} />
        </LoaderContainer>
      ) : null}
      {payload.txType === 'contract_call' && unsignedTx ? (
        <ContractCallRequest
          request={payload}
          unsignedTx={unsignedTx}
          funcMetaData={funcMetaData}
          attachment={attachment}
          coinsMetaData={coinsMetaData}
          tabId={Number(tabId)}
          requestToken={requestToken}
        />
      ) : null}
      {payload.txType === 'smart_contract' && unsignedTx ? (
        <ContractDeployRequest
          unsignedTx={unsignedTx}
          codeBody={codeBody!}
          contractName={contractName!}
          sponsored={payload?.sponsored}
          tabId={Number(tabId)}
          requestToken={requestToken}
        />
      ) : null}
    </>
  );
}

export default TransactionRequest;
