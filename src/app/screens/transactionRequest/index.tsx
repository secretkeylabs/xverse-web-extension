import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';
import ContractDeployRequest from '@components/transactionsRequests/ContractDeployTransaction';
import useNetworkSelector from '@hooks/useNetwork';
import useStxTransactionRequest from '@hooks/useStxTransactionRequest';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  Account,
  buf2hex,
  Coin,
  ContractFunction,
  createDeployContractRequest,
  extractFromPayload,
  fetchStxPendingTxData,
  getContractCallPromises,
  getTokenTransferRequest,
} from '@secretkeylabs/xverse-core';
import { ContractCallPayload, ContractDeployPayload } from '@stacks/connect';
import { StacksTransaction } from '@stacks/transactions';
import { getNetworkType, isHardwareAccount } from '@utils/helper';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

function TransactionRequest() {
  const { stxAddress, network, stxPublicKey, feeMultipliers, accountsList, selectedAccount } =
    useWalletSelector();
  const { payload, tabId, requestToken, stacksTransaction } = useStxTransactionRequest();
  const navigate = useNavigate();
  const selectedNetwork = useNetworkSelector();
  const { switchAccount } = useWalletReducer();
  const [unsignedTx, setUnsignedTx] = useState<StacksTransaction | null>(null);
  const [funcMetaData, setFuncMetaData] = useState<ContractFunction | undefined>(undefined);
  const [coinsMetaData, setCoinsMetaData] = useState<Coin[] | null>(null);
  const [codeBody, setCodeBody] = useState(undefined);
  const [contractName, setContractName] = useState(undefined);
  const [attachment, setAttachment] = useState<Buffer | undefined>(undefined);

  const handleTokenTransferRequest = async (tokenTransferPayload: any, requestAccount: Account) => {
    const stxPendingTxData = await fetchStxPendingTxData(stxAddress, selectedNetwork);
    const unsignedSendStxTx = await getTokenTransferRequest(
      tokenTransferPayload.recipient,
      tokenTransferPayload.amount,
      tokenTransferPayload.memo!,
      requestAccount.stxPublicKey,
      feeMultipliers!,
      selectedNetwork,
      stxPendingTxData || [],
      stacksTransaction?.auth,
    );
    setUnsignedTx(unsignedSendStxTx);
    navigate('/confirm-stx-tx', {
      state: {
        unsignedTx: buf2hex(unsignedSendStxTx.serialize()),
        sponsored: tokenTransferPayload.sponsored,
        isBrowserTx: true,
        tabId,
        requestToken,
      },
    });
  };

  const handleContractCallRequest = async (
    contractCallPayload: ContractCallPayload,
    requestAccount: Account,
  ) => {
    const {
      unSignedContractCall,
      contractInterface,
      coinsMetaData: coinMeta,
    } = await getContractCallPromises(
      contractCallPayload,
      requestAccount.stxAddress,
      selectedNetwork,
      requestAccount.stxPublicKey,
      stacksTransaction?.auth,
    );
    setUnsignedTx(unSignedContractCall);
    setCoinsMetaData(coinMeta);
    const invokedFuncMetaData: ContractFunction | undefined = contractInterface?.functions?.find(
      (func) => func.name === contractCallPayload.functionName,
    );
    const txAttachment = contractCallPayload.attachment ?? undefined;
    if (txAttachment) setAttachment(Buffer.from(txAttachment));
    if (invokedFuncMetaData) {
      setFuncMetaData(invokedFuncMetaData);
      const { funcArgs } = extractFromPayload(contractCallPayload);
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

  const handleContractDeployRequest = async (
    contractDeployPayload: ContractDeployPayload,
    requestAccount: Account,
  ) => {
    const response = await createDeployContractRequest(
      contractDeployPayload,
      selectedNetwork,
      requestAccount.stxPublicKey,
      feeMultipliers!,
      requestAccount.stxAddress,
      stacksTransaction?.auth,
    );
    setUnsignedTx(response.contractDeployTx);
    setCodeBody(response.codeBody);
    setContractName(response.contractName);
  };

  const handleTxSigningRequest = async (requestAccount: Account) => {
    if (payload.txType === 'contract_call') {
      await handleContractCallRequest(payload, requestAccount);
    } else if (payload.txType === 'smart_contract') {
      await handleContractDeployRequest(payload, requestAccount);
    } else {
      navigate('/confirm-stx-tx', {
        state: {
          unsignedTx: payload.txHex,
          sponsored: payload.sponsored,
          isBrowserTx: true,
          tabId,
          requestToken,
        },
      });
    }
  };

  const createRequestTx = async (account: Account) => {
    try {
      if (!payload.txHex) {
        if (payload.txType === 'token_transfer') {
          await handleTokenTransferRequest(payload, account);
        } else if (payload.txType === 'contract_call') {
          await handleContractCallRequest(payload, account);
        } else if (payload.txType === 'smart_contract') {
          await handleContractDeployRequest(payload, account);
        }
      } else {
        await handleTxSigningRequest(account);
      }
    } catch (e: unknown) {
      console.error(e); // eslint-disable-line
      toast.error('Unexpected error creating transaction');
    }
  };

  const handleRequest = async () => {
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
        await switchAccount(account);
        await createRequestTx(account);
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
    } else {
      await createRequestTx(selectedAccount!);
    }
  };

  useEffect(() => {
    handleRequest();
  }, []);

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
