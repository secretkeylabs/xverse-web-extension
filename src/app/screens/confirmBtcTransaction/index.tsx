import { ConfirmBtcTransactionState, LedgerTransactionType } from '@common/types/ledger';
import { MESSAGE_SOURCE, SatsConnectMethods } from '@common/types/message-types';
import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import AlertMessage from '@components/alertMessage';
import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import InfoContainer from '@components/infoContainer';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useBtcClient from '@hooks/useBtcClient';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { Return, RpcErrorCode } from '@sats-connect/core';
import { BtcTransactionBroadcastResponse, Recipient } from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import { isLedgerAccount } from '@utils/helper';
import { saveTimeForNonOrdinalTransferTransaction } from '@utils/localStorage';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import SendLayout from '../../layouts/sendLayout';

function ConfirmBtcTransaction() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { ordinalsAddress, btcAddress, selectedAccount } = useWalletSelector();
  const btcClient = useBtcClient();
  const [signedTx, setSignedTx] = useState<string>('');
  const [showOrdinalsDetectedAlert, setShowOrdinalsDetectedAlert] = useState(false);
  const location = useLocation();
  const { refetch } = useBtcWalletData();
  const { ordinals: ordinalsInBtc } = useOrdinalsByAddress(btcAddress);
  const {
    fee,
    amount,
    signedTxHex,
    recipient,
    recipientAddress,
    isRestoreFundFlow,
    unspentUtxos,
    btcSendBrowserTx,
    requestToken,
    tabId,
    isBrc20TokenFlow,
    feePerVByte,
    requestId,
  } = location.state;
  if (typeof fee !== 'string' && !BigNumber.isBigNumber(fee)) {
    Object.setPrototypeOf(fee, BigNumber.prototype);
  }

  const [currentFee, setCurrentFee] = useState(fee);
  const [currentFeeRate, setCurrentFeeRate] = useState(feePerVByte);

  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { txToBeBroadcasted: string }>({
    mutationFn: async ({ txToBeBroadcasted }) => btcClient.sendRawTransaction(txToBeBroadcasted),
  });

  const {
    error: errorBtcOrdinalTransaction,
    data: btcOrdinalTxBroadcastData,
    mutate: broadcastOrdinalTransaction,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { ordinalTxToBeBroadcasted: string }>({
    mutationFn: async ({ ordinalTxToBeBroadcasted }) =>
      btcClient.sendRawTransaction(ordinalTxToBeBroadcasted),
  });

  const onClick = () => {
    navigate('/restore-ordinals', {
      state: { isRestoreFundFlow: true },
    });
  };

  useResetUserFlow('/confirm-btc-tx');

  const onContinueButtonClick = () => {
    mutate({ txToBeBroadcasted: signedTx });
  };

  const handleBrowserTx = useCallback(
    (broadCastResult: BtcTransactionBroadcastResponse) => {
      if (requestToken) {
        const btcSendMessage = {
          source: MESSAGE_SOURCE,
          method: SatsConnectMethods.sendBtcResponse,
          payload: {
            sendBtcRequest: requestToken,
            sendBtcResponse: broadCastResult.tx.hash,
          },
        };
        chrome.tabs.sendMessage(+tabId, btcSendMessage);
      } else {
        const result: Return<'sendTransfer'> = {
          txid: broadCastResult.tx.hash,
        };
        const response = makeRpcSuccessResponse(requestId, result);
        sendRpcResponse(+tabId, response);
      }
      window.close();
    },
    [btcTxBroadcastData, requestToken, tabId],
  );

  useEffect(() => {
    if (!btcTxBroadcastData) return;
    if (btcSendBrowserTx) {
      handleBrowserTx(btcTxBroadcastData);
    } else {
      navigate('/tx-status', {
        state: {
          txid: btcTxBroadcastData.tx.hash,
          currency: 'BTC',
          error: '',
          isBrc20TokenFlow,
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [btcTxBroadcastData]);

  useEffect(() => {
    if (btcOrdinalTxBroadcastData) {
      saveTimeForNonOrdinalTransferTransaction(ordinalsAddress).then(() => {
        navigate('/tx-status', {
          state: {
            txid: btcOrdinalTxBroadcastData.tx.hash,
            currency: 'BTC',
            isOrdinal: true,
            error: '',
          },
        });
        setTimeout(() => {
          refetch();
        }, 1000);
      });
    }
  }, [btcOrdinalTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      if (btcSendBrowserTx) {
        const errorResponse = makeRPCError(requestId, {
          code: RpcErrorCode.INTERNAL_ERROR,
          message: txError.toString(),
        });
        sendRpcResponse(+tabId, errorResponse);
      }
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: txError.toString(),
          browserTx: btcSendBrowserTx,
        },
      });
    }
  }, [txError]);

  const handleOnConfirmClick = (txHex: string) => {
    if (isRestoreFundFlow) {
      broadcastOrdinalTransaction({ ordinalTxToBeBroadcasted: txHex });
      return;
    }

    if (ordinalsInBtc && ordinalsInBtc.length > 0) {
      setSignedTx(txHex);
      setShowOrdinalsDetectedAlert(true);
      return;
    }

    if (isLedgerAccount(selectedAccount)) {
      const txType: LedgerTransactionType = 'BTC';
      const state: ConfirmBtcTransactionState = {
        recipients: recipient,
        type: txType,
        feeRateInput: currentFeeRate,
        fee: currentFee,
      };

      navigate('/confirm-ledger-tx', { state });
      return;
    }

    mutate({ txToBeBroadcasted: txHex });
  };

  const goBackToScreen = () => {
    if (isRestoreFundFlow || isBrc20TokenFlow) {
      navigate(-1);
    } else if (btcSendBrowserTx) {
      if (requestToken) {
        const addressMessage = {
          source: MESSAGE_SOURCE,
          method: SatsConnectMethods.sendBtcResponse,
          payload: {
            sendBtcRequest: requestToken,
            sendBtcResponse: 'cancel',
          },
        };
        chrome.tabs.sendMessage(+tabId, addressMessage);
      } else {
        const cancelError = makeRPCError(requestId as string, {
          code: RpcErrorCode.USER_REJECTION,
          message: `User rejected request to send transfer`,
        });
        sendRpcResponse(+tabId, cancelError);
      }
      window.close();
    } else {
      navigate('/send-btc', {
        state: {
          amount,
          recipientAddress,
        },
      });
    }
  };
  const hideBackButton = location.key === 'default';

  const onClosePress = () => {
    setShowOrdinalsDetectedAlert(false);
  };

  return (
    <SendLayout
      selectedBottomTab="dashboard"
      onClickBack={goBackToScreen}
      hideBackButton={hideBackButton}
      showAccountHeader={btcSendBrowserTx}
      hideBottomBar={btcSendBrowserTx}
    >
      {showOrdinalsDetectedAlert && (
        <AlertMessage
          title={t('BTC_TRANSFER_DANGER_ALERT_TITLE')}
          description={t('BTC_TRANSFER_DANGER_ALERT_DESC')}
          buttonText={t('BACK')}
          onClose={onClosePress}
          secondButtonText={t('CONTINUE')}
          onButtonClick={onClosePress}
          onSecondButtonClick={onContinueButtonClick}
          isWarningAlert
        />
      )}
      <ConfirmBtcTransactionComponent
        feePerVByte={feePerVByte}
        recipients={recipient as Recipient[]}
        loadingBroadcastedTx={isLoading}
        signedTxHex={signedTxHex}
        isRestoreFundFlow={isRestoreFundFlow}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={goBackToScreen}
        nonOrdinalUtxos={unspentUtxos}
        currentFee={currentFee}
        setCurrentFee={setCurrentFee}
        currentFeeRate={currentFeeRate}
        setCurrentFeeRate={setCurrentFeeRate}
        currencyType="BTC"
      >
        {ordinalsInBtc && ordinalsInBtc.length > 0 && (
          <InfoContainer
            type="Warning"
            showWarningBackground
            bodyText={t('ORDINAL_DETECTED_WARNING')}
            redirectText={t('ORDINAL_DETECTED_ACTION')}
            onClick={onClick}
          />
        )}
      </ConfirmBtcTransactionComponent>
    </SendLayout>
  );
}

export default ConfirmBtcTransaction;
