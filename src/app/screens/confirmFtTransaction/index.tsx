import { ConfirmStxTransactionState, LedgerTransactionType } from '@common/types/ledger';
import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import TransferMemoView from '@components/confirmStxTransactionComponent/transferMemoView';
import RecipientComponent from '@components/recipientComponent';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import { broadcastSignedTransaction, StacksTransaction } from '@secretkeylabs/xverse-core';
import { deserializeTransaction } from '@stacks/transactions';
import { useMutation } from '@tanstack/react-query';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

function ConfirmFtTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const selectedNetwork = useNetworkSelector();
  const location = useLocation();
  const {
    unsignedTx: unsignedTxHex,
    amount,
    fungibleToken,
    memo,
    recepientAddress,
  } = location.state;
  const unsignedTx = useMemo(() => deserializeTransaction(unsignedTxHex), [unsignedTxHex]);
  const { refetch } = useStxWalletData();
  const { network, selectedAccount } = useWalletSelector();

  const {
    isLoading,
    error: txError,
    data: stxTxBroadcastData,
    mutate,
  } = useMutation<string, Error, { signedTx: StacksTransaction }>({
    mutationFn: async ({ signedTx }) => broadcastSignedTransaction(signedTx, selectedNetwork),
  });

  useEffect(() => {
    if (stxTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: stxTxBroadcastData,
          currency: 'STX',
          error: '',
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
        },
      });
    }
  }, [txError]);

  const handleOnConfirmClick = (txs: StacksTransaction[]) => {
    if (isLedgerAccount(selectedAccount)) {
      const type: LedgerTransactionType = 'STX';
      const state: ConfirmStxTransactionState = {
        unsignedTx: unsignedTx.serialize(),
        type,
        recipients: [{ address: recepientAddress, amountMicrostacks: new BigNumber(amount) }],
        fee: new BigNumber(unsignedTx.auth.spendingCondition.fee.toString()),
      };

      navigate('/confirm-ledger-tx', { state });
      return;
    }

    mutate({ signedTx: txs[0] });
  };

  const handleBackButtonClick = () => {
    navigate('/send-ft', {
      state: {
        recipientAddress: recepientAddress,
        amountToSend: amount.toString(),
        stxMemo: memo,
        fungibleToken,
      },
    });
  };

  return (
    <>
      <TopRow title={t('CONFIRM_TX')} onClick={handleBackButtonClick} />
      <ConfirmStxTransationComponent
        initialStxTransactions={[unsignedTx]}
        loading={isLoading}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={handleBackButtonClick}
        skipModal={isLedgerAccount(selectedAccount)}
      >
        <RecipientComponent
          address={recepientAddress}
          value={`${amount}`}
          fungibleToken={fungibleToken}
          title={t('AMOUNT')}
          currencyType="FT"
        />
        <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
        {memo && <TransferMemoView memo={memo} />}
      </ConfirmStxTransationComponent>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default ConfirmFtTransaction;
