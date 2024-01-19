import useBtcFeeRate from '@hooks/useBtcFeeRate';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useTransactionContext from '@hooks/useTransactionContext';
import { Transport, btcTransaction } from '@secretkeylabs/xverse-core';
import { isInOptions } from '@utils/helper';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  generateSendMaxTransaction,
  generateTransaction,
  type TransactionSummary,
} from './helpers';
import StepDisplay from './stepDisplay';
import { Step, getPreviousStep } from './steps';

function SendBtcScreen() {
  const navigate = useNavigate();

  const isInOption = isInOptions();

  useResetUserFlow('/send-btc');

  const location = useLocation();

  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();

  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountSats, setAmountSats] = useState(location.state?.amount || '');
  const [feeRate, setFeeRate] = useState('');
  const [sendMax, setSendMax] = useState(false);
  const amountEditable = location.state?.disableAmountEdit ?? true;

  const [currentStep, setCurrentStep] = useState<Step>(0);

  const transactionContext = useTransactionContext();
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();

  useEffect(() => {
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(btcFeeRate.regular.toString());
    }
  }, [btcFeeRate, feeRatesLoading]);

  const generateTransactionAndSummary = async (feeRateOverride?: number) => {
    const amountBigInt = BigInt(amountSats);
    const transactionDetails =
      sendMax && currentStep !== Step.Confirm
        ? await generateSendMaxTransaction(
            transactionContext,
            recipientAddress,
            feeRateOverride ?? +feeRate,
          )
        : await generateTransaction(
            transactionContext,
            recipientAddress,
            amountBigInt,
            feeRateOverride ?? +feeRate,
          );
    return transactionDetails;
  };

  useEffect(() => {
    if (!recipientAddress || !(amountSats || sendMax) || !feeRate) {
      setTransaction(undefined);
      setSummary(undefined);
      return;
    }

    const generateTxnAndSummary = async () => {
      setIsLoading(true);
      try {
        const transactionDetails = await generateTransactionAndSummary();

        setTransaction(transactionDetails.transaction);

        setSummary(transactionDetails.summary);

        if (sendMax && transactionDetails.summary) {
          setAmountSats(transactionDetails.summary.outputs[0].amount.toString());
        }
      } catch (e) {
        console.error(e);
        setTransaction(undefined);
        setSummary(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    generateTxnAndSummary();
  }, [transactionContext, recipientAddress, amountSats, feeRate, sendMax]);

  const handleCancel = () => {
    if (isInOption) {
      window.close();
      return;
    }
    navigate('/');
  };

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep, amountEditable));
    } else {
      handleCancel();
    }
  };

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const { summary: tempSummary } = await generateTransactionAndSummary(desiredFeeRate);
    if (tempSummary) return Number(tempSummary.fee);

    return undefined;
  };

  const handleSubmit = async (ledgerTransport?: Transport) => {
    try {
      setIsSubmitting(true);
      const txnId = await transaction?.broadcast({ ledgerTransport });
      navigate('/tx-status', {
        state: {
          txid: txnId,
          currency: 'BTC',
          error: '',
        },
      });
    } catch (e) {
      console.error(e);
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: `${e}`,
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
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      recipientAddress={recipientAddress}
      setRecipientAddress={setRecipientAddress}
      amountSats={amountSats}
      setAmountSats={setAmountSatsSafe}
      feeRate={feeRate}
      setFeeRate={handleFeeRateChange}
      sendMax={sendMax}
      setSendMax={setSendMax}
      getFeeForFeeRate={calculateFeeForFeeRate}
      amountEditable={amountEditable}
      onBack={handleBackButtonClick}
      onCancel={handleCancel}
      onConfirm={handleSubmit}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      summary={summary}
    />
  );
}

export default SendBtcScreen;
