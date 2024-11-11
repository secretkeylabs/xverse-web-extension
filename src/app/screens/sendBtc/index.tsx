import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useCanUserSwitchPaymentType from '@hooks/useCanUserSwitchPaymentType';
import useDebounce from '@hooks/useDebounce';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { AnalyticsEvents, btcTransaction, type Transport } from '@secretkeylabs/xverse-core';
import { isInOptions } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  generateSendMaxTransaction,
  generateTransaction,
  type TransactionSummary,
} from './helpers';
import StepDisplay from './stepDisplay';
import { Step } from './steps';

function SendBtcScreen() {
  const navigate = useNavigate();

  const isInOption = isInOptions();

  useResetUserFlow('/send-btc');

  const { selectedAccountType, btcPaymentAddressType } = useWalletSelector();
  const [overridePaymentType, setOverridePaymentType] = useState(btcPaymentAddressType);

  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const transactionContext = useTransactionContext(overridePaymentType);
  const userCanSwitchPayType = useCanUserSwitchPaymentType();

  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountSats, setAmountSats] = useState<string>('');
  const [feeRate, setFeeRate] = useState('');
  const [sendMax, setSendMax] = useState(false);

  const debouncedRecipient = useDebounce(recipientAddress, 500);

  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectRecipient);

  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();

  useEffect(() => {
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(btcFeeRate.regular.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- specifically don't care if feeRate changes
  }, [btcFeeRate, feeRatesLoading]);

  const generateTransactionAndSummary = async (feeRateOverride?: number) => {
    const amountBigInt = Number.isNaN(Number(amountSats)) ? 0n : BigInt(amountSats);
    return sendMax && currentStep !== Step.Confirm
      ? generateSendMaxTransaction(
          transactionContext,
          debouncedRecipient,
          feeRateOverride ?? +feeRate,
        )
      : generateTransaction(
          transactionContext,
          debouncedRecipient,
          amountBigInt,
          feeRateOverride ?? +feeRate,
        );
  };

  useEffect(() => {
    if (!debouncedRecipient || !feeRate) {
      setTransaction(undefined);
      setSummary(undefined);
      return;
    }

    const isCancelled = {
      current: false,
    };
    const generateTxnAndSummary = async () => {
      setIsLoading(true);
      try {
        const transactionDetails = await generateTransactionAndSummary();
        if (isCancelled.current) return;
        setTransaction(transactionDetails.transaction);
        if (transactionDetails.summary) {
          setSummary(transactionDetails.summary);
          if (sendMax) {
            setAmountSats(transactionDetails.summary.outputs[0].amount.toString());
          }
        } else {
          setTransaction(undefined);
          setSummary(undefined);
        }
      } catch (e) {
        if (isCancelled.current) return;
        if (!(e instanceof Error) || !e.message.includes('Insufficient funds')) {
          // don't log the error if it's just an insufficient funds error
          console.error(e);
        }
        setTransaction(undefined);
        setSummary(undefined);
      } finally {
        if (!isCancelled.current) {
          setIsLoading(false);
        }
      }
    };

    generateTxnAndSummary();

    return () => {
      isCancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- don't care if generateTxnAndSummary changes
  }, [transactionContext, debouncedRecipient, amountSats, feeRate, sendMax]);

  const handleCancel = () => {
    if (selectedAccountType === 'ledger' && isInOption) {
      window.close();
      return;
    }
    navigate(`/coinDashboard/BTC`);
  };

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const { summary: tempSummary } = await generateTransactionAndSummary(desiredFeeRate);
    if (tempSummary) return Number(tempSummary.fee);
    return undefined;
  };

  const handleSubmit = async (ledgerTransport?: Transport) => {
    try {
      setIsSubmitting(true);
      const txnId = await transaction?.broadcast({ ledgerTransport, rbfEnabled: true });

      trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
        protocol: 'bitcoin',
        action: 'transfer',
        wallet_type: selectedAccountType,
      });

      navigate('/tx-status', {
        state: {
          txid: txnId,
          currency: 'BTC',
          error: '',
          browserTx: isInOption,
        },
      });
    } catch (e) {
      console.error(e);
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: `${e}`,
          browserTx: isInOption,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeeRateChange = (newFeeRate: string) => {
    setFeeRate(newFeeRate);
    if (currentStep === Step.Confirm) {
      setSendMax(false);
    }
  };

  const setAmountSatsSafe = (newAmount: string) => {
    if (!Number.isNaN(+newAmount)) {
      setAmountSats(newAmount);
    }
  };

  return (
    <StepDisplay
      summary={summary}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      recipientAddress={recipientAddress}
      setRecipientAddress={setRecipientAddress}
      overridePaymentType={overridePaymentType}
      setOverridePaymentType={setOverridePaymentType}
      amountSats={amountSats}
      setAmountSats={setAmountSatsSafe}
      feeRate={feeRate}
      setFeeRate={handleFeeRateChange}
      getFeeForFeeRate={calculateFeeForFeeRate}
      sendMax={sendMax}
      setSendMax={setSendMax}
      onCancel={handleCancel}
      onConfirm={handleSubmit}
      isLoading={isLoading || recipientAddress !== debouncedRecipient}
      isSubmitting={isSubmitting}
      userCanSwitchPayType={userCanSwitchPayType}
    />
  );
}

export default SendBtcScreen;
