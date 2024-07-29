import { makeRPCError, makeRpcSuccessResponse, sendRpcResponse } from '@common/utils/rpc/helpers';
import { sendUserRejectionMessage } from '@common/utils/rpc/responseMessages/errors';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { RpcErrorCode, type TransferRunesRequest } from '@sats-connect/core';
import { type TransactionSummary } from '@screens/sendBtc/helpers';
import {
  btcTransaction,
  parseSummaryForRunes,
  runesTransaction,
  type RuneSummary,
  type Transport,
} from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';

type Args = {
  tabId: number;
  messageId: string;
  recipients: TransferRunesRequest['params']['recipients'];
};
const useTransferRunes = ({ tabId, messageId, recipients }: Args) => {
  const [txError, setTxError] = useState<{
    code: number | undefined;
    message: string;
  } | null>(null);
  const [feeRate, setFeeRate] = useState<string>('');
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();
  const [runesSummary, setRunesSummary] = useState<RuneSummary | undefined>();
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: btcFeeRates } = useBtcFeeRate();
  const { network } = useWalletSelector();
  const txContext = useTransactionContext();

  const generateTransferTxAndSummary = async (desiredFeeRate: number) => {
    const requestRecipients = recipients.map((recipient) => ({
      toAddress: recipient.address,
      runeName: recipient.runeName,
      amount: BigInt(recipient.amount),
    }));
    const tx = await runesTransaction.sendManyRunes(
      txContext,
      requestRecipients,
      Number(desiredFeeRate),
    );
    const txSummary = await tx.getSummary();
    const parsedRunesSummary = await parseSummaryForRunes(txContext, txSummary, network.type);
    return { tx, txSummary, parsedRunesSummary };
  };

  const buildTx = async (desiredFeeRate: number | undefined) => {
    try {
      if (!desiredFeeRate) return;
      setIsLoading(true);
      const { tx, txSummary, parsedRunesSummary } = await generateTransferTxAndSummary(
        desiredFeeRate,
      );
      setFeeRate(desiredFeeRate.toString());
      setTransaction(tx);
      setSummary(txSummary);
      setRunesSummary(parsedRunesSummary);
    } catch (e) {
      setTransaction(undefined);
      setSummary(undefined);
      setTxError({
        code: RpcErrorCode.INTERNAL_ERROR,
        message: (e as any).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const { txSummary } = await generateTransferTxAndSummary(desiredFeeRate);
    if (txSummary) return Number(txSummary.fee);

    return undefined;
  };

  useEffect(() => {
    let initialFeeRate: number | undefined = Number.parseInt(feeRate, 10);
    if (Number.isNaN(initialFeeRate)) {
      initialFeeRate = btcFeeRates?.priority;
    }

    buildTx(initialFeeRate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeRate, btcFeeRates?.priority]);

  const confirmRunesTransferRequest = async (ledgerTransport?: Transport) => {
    try {
      setIsExecuting(true);
      const txid = await transaction?.broadcast({
        ledgerTransport,
        rbfEnabled: false,
      });
      if (!txid) {
        const response = makeRPCError(messageId, {
          code: RpcErrorCode.INTERNAL_ERROR,
          message: 'Failed to broadcast transaction',
        });
        sendRpcResponse(+tabId, response);
        return;
      }
      const runesTransferResponse = makeRpcSuccessResponse<'runes_transfer'>(messageId, {
        txid,
      });
      sendRpcResponse(+tabId, runesTransferResponse);
      return txid;
    } catch (err) {
      const errorResponse = makeRPCError(messageId, {
        code: RpcErrorCode.INTERNAL_ERROR,
        message: JSON.stringify((err as any).response.data),
      });
      setTxError(errorResponse.error);
      sendRpcResponse(+tabId, errorResponse);
    } finally {
      setIsExecuting(false);
    }
  };

  const cancelRunesTransferRequest = async () => {
    sendUserRejectionMessage({ tabId, messageId });
  };

  return {
    transaction,
    summary,
    runesSummary,
    txError,
    feeRate,
    isLoading,
    isExecuting,
    setFeeRate,
    getFeeForFeeRate,
    confirmRunesTransferRequest,
    cancelRunesTransferRequest,
  };
};

export default useTransferRunes;
