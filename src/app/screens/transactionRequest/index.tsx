import { sendInternalErrorMessage } from '@common/utils/rpc/responseMessages/errors';
import ContractCallRequest from '@components/transactionsRequests/ContractCallRequest';
import ContractDeployRequest from '@components/transactionsRequests/ContractDeployRequest';
import useGetAllAccounts from '@hooks/useGetAllAccounts';
import useNetworkSelector from '@hooks/useNetwork';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTrackMixPanelPageViewed from '@hooks/useTrackMixPanelPageViewed';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import { getSwapsMixpanelProperties } from '@screens/swap/mixpanel';
import {
  AnalyticsEvents,
  createContractCallPromises,
  generateUnsignedTx,
  nextBestNonce,
  type Account,
  type Coin,
  type ContractFunction,
} from '@secretkeylabs/xverse-core';
import type { ContractCallPayload, ContractDeployPayload } from '@stacks/connect';
import { StacksTransactionWire } from '@stacks/transactions';
import Spinner from '@ui-library/spinner';
import { getNetworkType, getStxNetworkForBtcNetwork } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import RoutePaths from 'app/routes/paths';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useStxTransactionRequest, { type DataStxSignTransaction } from './useStxTransactionRequest';

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.s,
}));

function TransactionRequest() {
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const location = useLocation();
  const { dataStxSignTransactionOverride, mixpanelMetadata } = (location.state || {}) as {
    dataStxSignTransactionOverride?: DataStxSignTransaction;
    mixpanelMetadata: any;
  };
  const txReq = useStxTransactionRequest(dataStxSignTransactionOverride);
  const navigate = useNavigate();
  const selectedNetwork = useNetworkSelector();
  const { switchAccount } = useWalletReducer();
  const [unsignedTx, setUnsignedTx] = useState<StacksTransactionWire | null>(null);
  const [funcMetaData, setFuncMetaData] = useState<ContractFunction | undefined>(undefined);
  const [coinsMetaData, setCoinsMetaData] = useState<Coin[] | null>(null);
  const [codeBody, setCodeBody] = useState<string | undefined>(undefined);
  const [contractName, setContractName] = useState<string | undefined>(undefined);
  const [attachment, setAttachment] = useState<Buffer | undefined>(undefined);
  const { t } = useTranslation('translation', { keyPrefix: 'REQUEST_ERRORS' });
  const allAccounts = useGetAllAccounts();

  const { payload, tabId, requestToken, transaction } = txReq;
  const { messageId, rpcMethod } = 'rpcMethod' in txReq ? txReq : { messageId: '', rpcMethod: '' };

  let action: 'token_transfer' | 'contract_call' | 'smart_contract' | 'transfer' = 'transfer';
  if (
    payload.txType === 'token_transfer' ||
    payload.txType === 'contract_call' ||
    payload.txType === 'smart_contract'
  ) {
    action = payload.txType;
  }

  useTrackMixPanelPageViewed({
    protocol: 'stacks',
    action,
  });

  const requestedAccount = payload.stxAddress
    ? allAccounts.find((account) => account.stxAddress === payload.stxAddress)
    : selectedAccount;

  const onSignTransaction = () => {
    const trackingPayload = getSwapsMixpanelProperties(mixpanelMetadata);
    trackMixPanel(AnalyticsEvents.SignSwap, trackingPayload);
  };

  const handleTokenTransferRequest = async (tokenTransferPayload: any, requestAccount: Account) => {
    const nonce = await nextBestNonce(requestAccount.stxAddress, selectedNetwork);
    const unsignedSendStxTx = await generateUnsignedTx({
      payload: {
        ...tokenTransferPayload,
        network: selectedNetwork,
      },
      publicKey: requestAccount.stxPublicKey,
      nonce: transaction?.auth?.spendingCondition.nonce || nonce,
      fee: transaction?.auth?.spendingCondition.fee.toString() || '0',
    });
    setUnsignedTx(unsignedSendStxTx);

    navigate(RoutePaths.ConfirmStacksTransaction, {
      state: {
        unsignedTx: unsignedSendStxTx.serialize(),
        sponsored: tokenTransferPayload.sponsored,
        isBrowserTx: !dataStxSignTransactionOverride,
        tabId,
        messageId,
        requestToken,
        rpcMethod,
        broadcast: txReq.broadcast,
      },
    });
  };

  const handleContractCallRequest = async (
    contractCallPayload: ContractCallPayload,
    requestAccount: Account,
  ) => {
    const [unSignedContractCall, contractInterface, coinMeta] = await createContractCallPromises(
      contractCallPayload,
      selectedNetwork,
      requestAccount.stxPublicKey,
      transaction?.auth,
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
      if (invokedFuncMetaData?.args.length !== contractCallPayload.functionArgs.length) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'STX',
            error: t('MISSING_ARGUMENTS'),
            browserTx: true,
            tabId,
            messageId,
            rpcMethod,
          },
        });
      }
    }
  };

  const handleContractDeployRequest = async (
    contractDeployPayload: ContractDeployPayload,
    requestAccount: Account,
  ) => {
    const nonce = await nextBestNonce(requestAccount.stxAddress, selectedNetwork);
    const unsignedContractDeployTx = await generateUnsignedTx({
      payload: {
        ...contractDeployPayload,
        network: selectedNetwork,
      },
      publicKey: requestAccount.stxPublicKey,
      nonce: transaction?.auth?.spendingCondition.nonce || nonce,
      fee: transaction?.auth?.spendingCondition.fee.toString() || '0',
    });
    setUnsignedTx(unsignedContractDeployTx);
    setCodeBody(contractDeployPayload.codeBody);
    setContractName(contractDeployPayload.contractName);
  };

  const handleTxSigningRequest = async (requestAccount: Account) => {
    if (payload.txType === 'contract_call') {
      await handleContractCallRequest(payload, requestAccount);
    } else if (payload.txType === 'smart_contract') {
      await handleContractDeployRequest(payload, requestAccount);
    } else {
      navigate(RoutePaths.ConfirmStacksTransaction, {
        state: {
          unsignedTx: payload.txHex,
          fee: payload.fee,
          sponsored: payload.sponsored,
          isBrowserTx: true,
          tabId,
          requestToken,
          rpcMethod,
          messageId,
          broadcast: txReq.broadcast,
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
      // eslint-disable-next-line no-console
      console.error(e);
      toast.error('Unexpected error creating transaction');
      sendInternalErrorMessage({ tabId, messageId });
    }
  };

  const handleRequest = async () => {
    if (
      payload.network &&
      getNetworkType(payload.network) !== getStxNetworkForBtcNetwork(network.type)
    ) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: t('NETWORK_MISMATCH'),
          browserTx: true,
          tabId,
          messageId,
        },
      });
      return;
    }

    if (selectedAccount.ordinalsAddress === requestedAccount?.btcAddresses.taproot.address) {
      // correct address already selected
      await createRequestTx(selectedAccount);
      return;
    }

    if (requestedAccount) {
      switchAccount(requestedAccount);
      await createRequestTx(requestedAccount);
    } else {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: t('ADDRESS_MISMATCH_STX'),
          browserTx: true,
          tabId,
          messageId,
          rpcMethod,
        },
      });
    }
  };

  useEffect(() => {
    handleRequest();
  }, []);

  return (
    <>
      {!unsignedTx ? (
        <LoaderContainer>
          <Spinner color="white" size={50} />
        </LoaderContainer>
      ) : null}
      {payload && payload.txType === 'contract_call' && unsignedTx ? (
        <ContractCallRequest
          request={payload}
          unsignedTx={unsignedTx}
          broadcastAfterSigning={txReq.broadcast}
          funcMetaData={funcMetaData}
          attachment={attachment}
          coinsMetaData={coinsMetaData}
          tabId={Number(tabId)}
          requestToken={requestToken}
          messageId={messageId}
          rpcMethod={rpcMethod}
          onSignTransaction={onSignTransaction}
        />
      ) : null}
      {payload && payload.txType === 'smart_contract' && unsignedTx ? (
        <ContractDeployRequest
          unsignedTx={unsignedTx}
          broadcastAfterSigning={txReq.broadcast}
          codeBody={codeBody!}
          contractName={contractName!}
          sponsored={payload?.sponsored}
          tabId={Number(tabId)}
          requestToken={requestToken}
          messageId={messageId}
          rpcMethod={rpcMethod}
        />
      ) : null}
    </>
  );
}

export default TransactionRequest;
