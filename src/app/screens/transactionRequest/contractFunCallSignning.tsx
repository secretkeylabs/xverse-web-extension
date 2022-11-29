import React, { useEffect, useReducer, useState } from 'react';
import { StacksTransaction } from '@stacks/transactions';
import { useDispatch } from 'react-redux';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  broadcastSignedTransaction,
  fetchStxPendingTxData,
  generateUnsignedContractCall,
  getCoinsInfo,
  getNewNonce,
  getNonce,
  setNonce,
} from '@secretkeylabs/xverse-core';
import { Ring } from 'react-spinners-css';
import { fetchStxWalletDataRequestAction } from '@stores/wallet/actions/actionCreators';
import { useNavigate } from 'react-router-dom';
import ConfirmTransaction from '@components/confirmTransactionScreen';
import { ContractCallPayload } from '@stacks/connect';
import { reducer, initialState } from './reducer';
import { extractFromPayload, getContractInterface, getFTInfoFromPostConditions } from './helper';
import Renderer from './renderer';

interface ContractFuncCallSigningProps {
  decodedTxRequest: ContractCallPayload;
  successCallback: () => void;
  cancelCallback: () => void;
}

function ContractFuncCallSigning(props: ContractFuncCallSigningProps): JSX.Element {
  const {
    decodedTxRequest, successCallback, cancelCallback,
  } = props;
  const [
    {
      functionArguments, unsignedFunctionCallTx, funcMetaData, coinMetaData, postConditions,
    },
    dispatch,
  ] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const [isTxSuccessful, setIsTxSuccessful] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPostConditionMessage, setShowPostConditionMessage] = useState(false);
  const [isShowMore, setIsShowMore] = useState(false);
  const reduxDispatch = useDispatch();
  const {
    stxPublicKey,
    selectedAccount,
    stxAddress,
    network,
    feeMultipliers,
    fiatCurrency,
    stxBtcRate,
  } = useWalletSelector();

  const createAllPromises = async (payload: any) => {
    const { pendingTransactions } = await fetchStxPendingTxData(stxAddress, network);
    const { funcArgs, postConds } = extractFromPayload(payload);
    dispatch({
      type: 'UPDATE_FUNC_ARGS_POST_COND',
      payload: {
        funcArgs,
        postConds,
      },
    });

    const ftContactAddresses = getFTInfoFromPostConditions(postConds);

    const coinsMetaDataPromise = getCoinsInfo(ftContactAddresses, fiatCurrency);

    const unSignedContractCall = await generateUnsignedContractCall({
      contractAddress: payload.contractAddress,
      contractName: payload.contractName,
      functionName: payload.functionName,
      publicKey: stxPublicKey,
      functionArgs: funcArgs,
      network,
      postConditions: postConds,
      postConditionMode: payload.postConditionMode,
      sponsored,
      nonce: undefined,
    });
    const { fee } = unSignedContractCall.auth.spendingCondition;
    if (feeMultipliers) {
      unSignedContractCall.setFee(fee * BigInt(feeMultipliers.otherTxMultiplier));
    }

    const checkForPostConditionMessage = decodedTxRequest?.payload?.postConditionMode === 2
      && decodedTxRequest?.payload?.postConditions?.values.length <= 0;
    checkForPostConditionMessage
      ? setShowPostConditionMessage(true)
      : setShowPostConditionMessage(false);

    const newNonce = getNewNonce(pendingTransactions, getNonce(unSignedContractCall));
    setNonce(unSignedContractCall, newNonce);

    const contractInterfacePromise = getContractInterface(
      payload.contractAddress,
      payload.contractName,
      network,
    );

    return Promise.all([unSignedContractCall, contractInterfacePromise, coinsMetaDataPromise]);
  };

  useEffect(() => {
    (async () => {
      try {
        const [unSignedContractCall, contractInterface, coinsMetaData] = await createAllPromises(
          decodedTxRequest.payload,
        );

        const invokedFuncMetaData = contractInterface?.functions?.find(
          (func) => func.name === decodedTxRequest.payload.functionName,
        );
        if (invokedFuncMetaData) {
          dispatch({
            type: 'PREPARE_INITIAL_TX_META',
            payload: {
              unsignedFunctionCallTx: unSignedContractCall,
              funcMetaData: invokedFuncMetaData,
              coinMetaData: coinsMetaData,
            },
          });
        } else {
          throw new Error('Unable to find the function metadata.'); // TODO: Add translation
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          navigate(-1);
        }
      }
    })();
  }, [stxPublicKey]);

  useEffect(
    () => () => {
      if (!isTxSuccessful) {
        cancelCallback();
      }
      dispatch({ type: 'RESET_STATE' });
    },
    [],
  );

  const broadcastTx = async (tx: StacksTransaction) => {
    try {
      setIsLoading(true);
      const networkType = network?.type ?? 'Mainnet';

      const broadcastResult: string = await broadcastSignedTransaction(tx, networkType);
      if (broadcastResult) {
        successCallback({
          txId: broadcastResult,
          txRaw: tx.serialize().toString('hex'),
        });
        reduxDispatch(
          fetchStxWalletDataRequestAction(stxAddress, network, fiatCurrency, stxBtcRate),
        );
        setIsTxSuccessful(true);
        navigate('/tx-status', {
          state: {
            txid: broadcastResult,
            currency: 'STX',
            error: '',
          },
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'STX',
            error: e.toString(),
          },
        });
        console.error(e.message);
        console.error(e.stack);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderer = new Renderer(
    isShowMore,
    decodedTxRequest,
    functionArguments,
    funcMetaData,
    postConditions,
    stxAddress,
    coinMetaData,
  );

  const sponsorTransactionTag = (
    <div>
      <div>
        <p>transactions.sponsored_transaction</p>
      </div>
    </div>
  );

  return (
    <div>
      {unsignedFunctionCallTx && funcMetaData ? (
        <ConfirmTransaction
          initialTransactions={[unsignedFunctionCallTx]}
          loading={isLoading}
          onCancelClick={() => {
            navigate(-1);
          }}
          onConfirmClick={(transactions: StacksTransaction[]) => {
            const tx: StacksTransaction = transactions[0];
            if (!sponsored) broadcastTx(tx);
            else {
              successCallback({
                txRaw: tx.serialize().toString('hex'),
              });
              setIsTxSuccessful(true);
              navigate('/tx-status', {
                state: {
                  currency: 'STX',
                  error: '',
                  sponsored: true,
                },
              });
            }
          }}
          hasShowMore
          account={selectedAccount}
          isSponsored={sponsored}
        >
          {renderer.header}
          {sponsored && sponsorTransactionTag}
          {showPostConditionMessage && renderer.postConditionDenyMessage}
          {renderer.postConditionCards}
          {renderer.functionMetaDataView}
          {renderer.functionArgsView}
          <div>
            <button onClick={() => setIsShowMore(!isShowMore)} type="button">
              <p>{isShowMore ? 'Show Less ' : 'Show More '}</p>
              <p>{isShowMore ? '-' : '+'}</p>
            </button>
          </div>
        </ConfirmTransaction>
      ) : (
        <Ring color="white" size={20} />
      )}
    </div>
  );
}

export default ContractFuncCallSigning;
