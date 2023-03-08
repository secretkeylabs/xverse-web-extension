import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStxFiatEquivalent, microstacksToStx } from '@secretkeylabs/xverse-core/currency';
import { StacksTransaction, TokenTransferPayload } from '@secretkeylabs/xverse-core/types';
import { addressToString, broadcastSignedTransaction } from '@secretkeylabs/xverse-core/transactions';
import { StoreState } from '@stores/index';
import BottomBar from '@components/tabBar';
import { fetchStxWalletDataRequestAction } from '@stores/wallet/actions/actionCreators';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import TopRow from '@components/topRow';
import AccountHeaderComponent from '@components/accountHeader';
import finalizeTxSignature from '@components/transactionsRequests/utils';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import InfoContainer from '@components/infoContainer';
import useNetworkSelector from '@hooks/useNetwork';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import RecipientComponent from '@components/recipientComponent';
import TransferMemoView from '@components/confirmStxTransactionComponent/transferMemoView';
import ConfirmStxTransationComponent from '../../components/confirmStxTransactionComponent';

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
  const dispatch = useDispatch();
  const location = useLocation();
  const selectedNetwork = useNetworkSelector();
  const {
    unsignedTx, sponsored, isBrowserTx, tabId, requestToken,
  } = location.state;
  useOnOriginTabClose(Number(tabId), () => {
    setHasTabClosed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  const {
    stxBtcRate, btcFiatRate, network, stxAddress, fiatCurrency,
  } = useSelector(
    (state: StoreState) => state.walletState,
  );
  const {
    isLoading,
    error: txError,
    data: stxTxBroadcastData,
    mutate,
  } = useMutation<
  string,
  Error,
  { signedTx: StacksTransaction }>(async ({ signedTx }) => broadcastSignedTransaction(signedTx, selectedNetwork));

  useEffect(() => {
    if (stxTxBroadcastData) {
      if (isBrowserTx) {
        finalizeTxSignature({ requestPayload: requestToken, tabId: Number(tabId), data: { txId: stxTxBroadcastData, txRaw } });
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
        dispatch(fetchStxWalletDataRequestAction(stxAddress, selectedNetwork, fiatCurrency, stxBtcRate));
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
        },
      });
    }
  }, [txError]);

  function updateUI() {
    const txPayload = unsignedTx.payload as TokenTransferPayload;

    if (txPayload.recipient.address) {
      setRecipient(addressToString(txPayload.recipient.address));
    }

    const txAmount = new BigNumber(txPayload.amount.toString(10));
    const txFee = new BigNumber(unsignedTx.auth.spendingCondition.fee.toString());
    const txTotal = amount.plus(fee);
    const txFiatAmount = getStxFiatEquivalent(amount, stxBtcRate, btcFiatRate);
    const txFiatTotal = getStxFiatEquivalent(amount, stxBtcRate, btcFiatRate);
    const { memo: txMemo } = txPayload;

    setAmount(txAmount);
    setStateFee(txFee);
    setFiatAmount(txFiatAmount);
    setTotal(txTotal);
    setFiatTotal(txFiatTotal);
    setMemo(txMemo.content);
  }

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

  const handleOnConfirmClick = (txs: StacksTransaction[]) => {
    setTxRaw(txs[0].serialize().toString('hex'));
    mutate({ signedTx: txs[0] });
  };

  const handleOnCancelClick = () => {
    if (isBrowserTx) {
      finalizeTxSignature({ requestPayload: requestToken, tabId: Number(tabId), data: 'cancel' });
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
      {isBrowserTx ? <AccountHeaderComponent disableMenuOption disableAccountSwitch />
        : <TopRow title={t('CONFIRM_TRANSACTION.CONFIRM_TX')} onClick={handleOnCancelClick} />}
      <ConfirmStxTransationComponent
        initialStxTransactions={[unsignedTx]}
        loading={isLoading}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={handleOnCancelClick}
        isSponsored={sponsored}
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
          <InfoContainer titleText={t('WINDOW_CLOSED_ALERT.TITLE')} bodyText={t('WINDOW_CLOSED_ALERT.BODY')} />
        </AlertContainer>
        )}

      </ConfirmStxTransationComponent>
      {!isBrowserTx && <BottomBar tab="dashboard" />}
    </>
  );
}
export default ConfirmStxTransaction;
