import IconStacks from '@assets/img/dashboard/stx_icon.svg';
import type { ConfirmStxTransactionState } from '@common/types/ledger';
import {
  sendInternalErrorMessage,
  sendUserRejectionMessage,
} from '@common/utils/rpc/responseMessages/errors';
import {
  sendSignTransactionSuccessResponseMessage,
  sendStxTransferSuccessResponseMessage,
} from '@common/utils/rpc/responseMessages/stacks';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmStxTransactionComponent from '@components/confirmStxTransactionComponent';
import TransferMemoView from '@components/confirmStxTransactionComponent/transferMemoView';
import InfoContainer from '@components/infoContainer';
import RecipientComponent from '@components/recipientComponent';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import finalizeTxSignature from '@components/transactionsRequests/utils';
import useDelegationState from '@hooks/queries/useDelegationState';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { StxRequests } from '@sats-connect/core';
import {
  AnalyticsEvents,
  broadcastSignedTransaction,
  isMultiSig,
  microstacksToStx,
  stxToMicrostacks,
  type TokenTransferPayloadWire,
} from '@secretkeylabs/xverse-core';
import {
  deserializeTransaction,
  type MultiSigSpendingCondition,
  type StacksTransactionWire,
} from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import Callout from '@ui-library/callout';
import { XVERSE_POOL_ADDRESS } from '@utils/constants';
import { isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const AlertContainer = styled.div((props) => ({
  marginTop: props.theme.space.l,
}));

const SpendDelegatedStxWarning = styled(Callout)((props) => ({
  marginBottom: props.theme.space.m,
}));

const Subtitle = styled.p`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.xs};
`;

function ConfirmStxTransaction() {
  const { t } = useTranslation('translation');
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const [txRaw, setTxRaw] = useState('');
  const navigate = useNavigate();
  const selectedNetwork = useNetworkSelector();
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const { data: stxData } = useStxWalletData();
  const { refetch } = useStxWalletData();
  const { data: delegateState } = useDelegationState();

  const location = useLocation();
  const {
    unsignedTx: stringHex,
    sponsored,
    isBrowserTx,
    tabId,
    messageId,
    rpcMethod,
    requestToken,
    fee: stateFee,
    broadcast = true,
  } = location.state as {
    tabId?: chrome.tabs.Tab['id'];
    messageId?: string;
    rpcMethod?: keyof StxRequests;
    [key: string]: any;
    broadcast: boolean;
  };
  const unsignedTx = useMemo(() => deserializeTransaction(stringHex), [stringHex]);

  const [feeRate, setFeeRate] = useState(
    stateFee ? microstacksToStx(new BigNumber(stateFee)).toString() : '',
  );

  const txPayload = unsignedTx.payload as TokenTransferPayloadWire;
  const recipient = txPayload.recipient.value;
  const amount = new BigNumber(txPayload.amount.toString(10));
  const memo = txPayload.memo.content.split('\u0000').join('');
  const delegatedAmount =
    delegateState?.delegated &&
    delegateState.amount &&
    delegateState.delegatedTo === XVERSE_POOL_ADDRESS
      ? delegateState.amount
      : '0';

  const getIsSpendDelegateStx = () => {
    if (!amount || !recipient) {
      return false;
    }

    const hasDelegationNotLocked = BigNumber(delegatedAmount).gt(
      stxToMicrostacks(BigNumber(1)).plus(stxData?.locked ?? new BigNumber(0)),
    );
    // stacking contract locks 1stx less from what user delegates to let them revoke delegation. counting this doesn't harm cause probably no one will top up just 1stx and min amount to first delegation is 100stx.

    const fee = new BigNumber(unsignedTx?.auth?.spendingCondition?.fee.toString() ?? '0');
    const total = amount.plus(fee);
    return (
      hasDelegationNotLocked &&
      BigNumber(total)
        .plus(delegatedAmount)
        .gt(stxData?.availableBalance ?? new BigNumber(0))
    );
  };

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
    mutate: broadcastTransaction,
  } = useMutation<string, Error, { signedTx: StacksTransactionWire }>({
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
          if (!broadcast) window.close();
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

  const handleConfirmClick = (txs: StacksTransactionWire[]) => {
    if (isLedgerAccount(selectedAccount)) {
      const fee = new BigNumber(txs[0].auth.spendingCondition.fee.toString());
      const state: ConfirmStxTransactionState = {
        unsignedTx: Buffer.from(unsignedTx.serializeBytes()),
        recipients: [{ address: recipient, amountMicrostacks: amount }],
        fee,
        tabId,
        messageId,
        rpcMethod,
      };

      navigate('/confirm-ledger-stx-tx', { state });
      return;
    }
    const rawTx = txs[0].serialize();
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
              result: { transaction: rawTx, txid: stxTxBroadcastData ?? '' },
            });
            break;
          }
          default: {
            sendInternalErrorMessage({ tabId, messageId });
          }
        }
        if (!broadcast) window.close();
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
      trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
        protocol: 'stacks',
        action: 'transfer',
        wallet_type: selectedAccount?.accountType || 'software',
      });

      if (broadcast) {
        broadcastTransaction({ signedTx: txs[0] });
      } else if (tabId) {
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
              result: { transaction: rawTx, txid: stxTxBroadcastData ?? '' },
            });
            break;
          }
          default: {
            sendInternalErrorMessage({ tabId, messageId });
          }
        }
        if (!broadcast) window.close();
      }
    }
  };

  const handleGoBack = () => {
    trackMixPanel(AnalyticsEvents.InitiateSendFlow, {
      selectedToken: 'STX',
      source: 'send_stx',
    });
    navigate('/send-stx', {
      state: {
        recipientAddress: recipient,
        amountToSend: microstacksToStx(amount).toString(),
        stxMemo: memo,
      },
    });
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
      navigate('/');
    }
  };

  const showSpendDelegateStxWarning = getIsSpendDelegateStx();

  return (
    <>
      {isBrowserTx ? (
        <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      ) : (
        <TopRow onClick={handleGoBack} />
      )}
      <ConfirmStxTransactionComponent
        initialStxTransactions={[unsignedTx]} // TODO: Refactor this to pass a single element instead of an array?
        loading={isLoading}
        onConfirmClick={handleConfirmClick}
        onCancelClick={handleCancelClick}
        isSponsored={sponsored}
        skipModal={isLedgerAccount(selectedAccount)}
        hasSignatures={hasSignatures}
        fee={feeRate}
        setFeeRate={setFeeRate}
      >
        {showSpendDelegateStxWarning && (
          <SpendDelegatedStxWarning variant="warning" bodyText={t('SEND.SPEND_DELEGATED_STX')} />
        )}
        <RecipientComponent
          dataTestID="confirm-amount"
          address={recipient}
          value={microstacksToStx(amount).toString()}
          icon={IconStacks}
          currencyType="STX"
          title={t('CONFIRM_TRANSACTION.AMOUNT')}
        />
        <Subtitle>{t('CONFIRM_TRANSACTION.TRANSACTION_DETAILS')}</Subtitle>
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
