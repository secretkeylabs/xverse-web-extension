import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StacksTransaction } from '@secretkeylabs/xverse-core/types';
import { broadcastSignedTransaction } from '@secretkeylabs/xverse-core/transactions';
import { deserializeTransaction } from '@stacks/transactions';
import BottomBar from '@components/tabBar';
import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import TopRow from '@components/topRow';
import useNetworkSelector from '@hooks/useNetwork';
import RecipientComponent from '@components/recipientComponent';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import TransferMemoView from '@components/confirmStxTransactionComponent/transferMemoView';
import useStxWalletData from '@hooks/queries/useStxWalletData';
import useWalletSelector from '@hooks/useWalletSelector';

function ConfirmFtTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const selectedNetwork = useNetworkSelector();
  const location = useLocation();
  const { unsignedTx: seedHex, amount, fungibleToken, memo, recepientAddress } = location.state;
  const unsignedTx = deserializeTransaction(seedHex);
  const { refetch } = useStxWalletData();

  const { network } = useWalletSelector();

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
