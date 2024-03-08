import IconStacks from '@assets/img/dashboard/stx_icon.svg';
import { ConfirmStxTransactionState, LedgerTransactionType } from '@common/types/ledger';
import {
  sendInternalErrorMessage,
  sendSignTransactionSuccessResponseMessage,
  sendStxTransferSuccessResponseMessage,
  sendUserRejectionMessage,
} from '@common/utils/rpc/stx/rpcResponseMessages';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmStxTransactionComponent from '@components/confirmStxTransactionComponent';
import TransferMemoView from '@components/confirmStxTransactionComponent/transferMemoView';
import InfoContainer from '@components/infoContainer';
import RecipientComponent from '@components/recipientComponent';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import finalizeTxSignature from '@components/transactionsRequests/utils';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  StacksTransaction,
  TokenTransferPayload,
  addressToString,
  broadcastSignedTransaction,
  buf2hex,
  getStxFiatEquivalent,
  isMultiSig,
  microstacksToStx,
} from '@secretkeylabs/xverse-core';
import { MultiSigSpendingCondition, deserializeTransaction } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { StxRequests } from 'sats-connect';
import styled from 'styled-components';

const AlertContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(12),
}));

function ConfirmStxTransaction() {
  const { t } = useTranslation('translation');
  const [fee, setStateFee] = useState(new BigNumber(0));
  const [amount, setAmount] = useState(new BigNumber(0));
  const [fiatAmount, setFiatAmount] = useState(new BigNumber(0));
  const [total, setTotal] = useState(new BigNumber(0));
  const [fiatTotal, setFiatTotal] = useState(new BigNumber(0));
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [txRaw, setTxRaw] = useState('');
  const [memo, setMemo] = useState('');
  const navigate = useNavigate();
  const selectedNetwork = useNetworkSelector();
  const { stxBtcRate, btcFiatRate, network, selectedAccount } = useWalletSelector();
  const { refetch } = useStxWalletData();

  const location = useLocation();
  const {
    unsignedTx: stringHex,
    sponsored,
    isBrowserTx,
    tabId,
    messageId,
    rpcMethod,
    requestToken,
  } = location.state as {
    tabId?: chrome.tabs.Tab['id'];
    messageId?: string;
    rpcMethod?: keyof StxRequests;
    [key: string]: any;
  };
  const unsignedTx = useMemo(() => deserializeTransaction(stringHex), [stringHex]);

  // SignTransaction Params
  const isMultiSigTx = useMemo(() => isMultiSig(unsignedTx), [unsignedTx]);
  const hasSignatures = useMemo(
    () =>
      isMultiSigTx &&
      (unsignedTx.auth.spendingCondition as MultiSigSpendingCondition).fields?.length > 0,
    [unsignedTx, isMultiSigTx],
  );

  useOnOriginTabClose(Number(tabId), () => {
    setHasTabClosed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const {
    isLoading,
    error: txError,
    data: stxTxBroadcastData,
    mutate,
  } = useMutation<string, Error, { signedTx: StacksTransaction }>({
    mutationFn: async ({ signedTx }) => broadcastSignedTransaction(signedTx, selectedNetwork),
  });

  useEffect(() => {
    // This useEffect runs when the tx has been broadcasted
    if (stxTxBroadcastData) {
      if (isBrowserTx) {
        if (tabId && messageId && rpcMethod) {
          switch (rpcMethod) {
            case 'stx_signTransaction': {
              sendSignTransactionSuccessResponseMessage({
                tabId,
                messageId,
                result: { transaction: txRaw },
              });
              break;
            }
            case 'stx_transferStx': {
              sendStxTransferSuccessResponseMessage({
                tabId,
                messageId,
                result: { transaction: txRaw, txid: stxTxBroadcastData },
              });
              break;
            }
            default: {
              sendInternalErrorMessage({ tabId, messageId });
            }
          }
        } else {
          finalizeTxSignature({
            requestPayload: requestToken,
            tabId: Number(tabId),
            data: { txId: stxTxBroadcastData, txRaw },
          });
        }
      }
      navigate('/tx-status', {
        state: {
          txid: stxTxBroadcastData,
          currency: 'STX',
          error: '',
          browserTx: isBrowserTx,
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [stxTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: txError.toString(),
          browserTx: isBrowserTx,
          tabId,
          messageId,
        },
      });
    }
  }, [txError]);

  const updateUI = () => {
    const txPayload = unsignedTx.payload as TokenTransferPayload;

    if (txPayload.recipient.address) {
      setRecipient(addressToString(txPayload.recipient.address));
    }

    const txAmount = new BigNumber(txPayload.amount.toString(10));
    const txFee = new BigNumber(unsignedTx.auth.spendingCondition.fee.toString());
    const txTotal = amount.plus(fee);
    const txFiatAmount = getStxFiatEquivalent(
      amount,
      BigNumber(stxBtcRate),
      BigNumber(btcFiatRate),
    );
    const txFiatTotal = getStxFiatEquivalent(amount, BigNumber(stxBtcRate), BigNumber(btcFiatRate));
    const { memo: txMemo } = txPayload;
    // the txPayload returns a string of null bytes incase memo is null
    // remove null bytes so send form treats it as an empty string
    const modifiedMemoString = txMemo.content.split('\u0000').join('');

    setAmount(txAmount);
    setStateFee(txFee);
    setFiatAmount(txFiatAmount);
    setTotal(txTotal);
    setFiatTotal(txFiatTotal);
    setMemo(modifiedMemoString);
  };

  useEffect(() => {
    if (recipient === '' || !fee || !amount || !fiatAmount || !total || !fiatTotal) {
      updateUI();
    }
  });

  const getAmount = () => {
    const txPayload = unsignedTx?.payload as TokenTransferPayload;
    const amountToTransfer = new BigNumber(txPayload?.amount?.toString(10));
    return microstacksToStx(amountToTransfer);
  };

  const handleConfirmClick = (txs: StacksTransaction[]) => {
    if (isLedgerAccount(selectedAccount)) {
      const type: LedgerTransactionType = 'STX';
      const state: ConfirmStxTransactionState = {
        unsignedTx: Buffer.from(unsignedTx.serialize()),
        type,
        recipients: [{ address: recipient, amountMicrostacks: amount }],
        fee,
      };

      navigate('/confirm-ledger-tx', { state });
      return;
    }
    const rawTx = buf2hex(txs[0].serialize());
    setTxRaw(rawTx);
    if (isMultiSigTx && isBrowserTx) {
      // A quick way to infer whether the app is responding to an RPC request.
      if (tabId && messageId) {
        switch (rpcMethod) {
          case 'stx_signTransaction': {
            sendSignTransactionSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: rawTx },
            });
            break;
          }
          case 'stx_transferStx': {
            sendStxTransferSuccessResponseMessage({
              tabId,
              messageId,
              result: { transaction: txRaw, txid: stxTxBroadcastData ?? '' },
            });
            break;
          }
          default: {
            sendInternalErrorMessage({ tabId, messageId });
          }
        }
      } else {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId: Number(tabId),
          // No TxId since the tx was not broadcasted
          data: { txId: '', txRaw: rawTx },
        });
      }
      window.close();
    } else {
      mutate({ signedTx: txs[0] });
    }
  };

  const handleCancelClick = () => {
    if (isBrowserTx) {
      // A quick way to infer whether the app is responding to an RPC request.
      if (tabId && messageId) {
        sendUserRejectionMessage({ tabId, messageId });
      } else {
        finalizeTxSignature({ requestPayload: requestToken, tabId: Number(tabId), data: 'cancel' });
      }
      window.close();
    } else {
      navigate('/send-stx', {
        state: {
          recipientAddress: recipient,
          amountToSend: getAmount().toString(),
          stxMemo: memo,
        },
      });
    }
  };

  return (
    <>
      {isBrowserTx ? (
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      ) : (
        <TopRow title={t('CONFIRM_TRANSACTION.CONFIRM_TX')} onClick={handleCancelClick} />
      )}
      <ConfirmStxTransactionComponent
        initialStxTransactions={[unsignedTx]}
        loading={isLoading}
        onConfirmClick={handleConfirmClick}
        onCancelClick={handleCancelClick}
        isSponsored={sponsored}
        skipModal={isLedgerAccount(selectedAccount)}
        hasSignatures={hasSignatures}
      >
        <RecipientComponent
          address={recipient}
          value={getAmount().toString()}
          icon={IconStacks}
          currencyType="STX"
          title={t('CONFIRM_TRANSACTION.AMOUNT')}
        />
        <TransactionDetailComponent title={t('CONFIRM_TRANSACTION.NETWORK')} value={network.type} />
        {memo && <TransferMemoView memo={memo} />}
        {hasTabClosed && (
          <AlertContainer>
            <InfoContainer
              titleText={t('WINDOW_CLOSED_ALERT.TITLE')}
              bodyText={t('WINDOW_CLOSED_ALERT.BODY')}
            />
          </AlertContainer>
        )}
      </ConfirmStxTransactionComponent>
      {!isBrowserTx && <BottomBar tab="dashboard" />}
    </>
  );
}

export default ConfirmStxTransaction;
