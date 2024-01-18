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

  // TODO: remove amount and address defaults
  const [recipientAddress, setRecipientAddress] = useState(
    location.state?.recipientAddress || '2MvD5Ug9arybH1K4rJNDwiNaSCw9cPxfyZn',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [amountSats, setAmountSats] = useState(location.state?.amount || '1000000');
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
    if (!recipientAddress || !amountSats || !feeRate) {
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
        // TODO: handle error
        console.error(e);
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
    // TODO: validate, set loading, error handling, redirect to txn confirmation screen
    await transaction?.broadcast({ ledgerTransport });
    navigate('/');
  };

  const handleFeeRateChange = (newFeeRate: string) => {
    setFeeRate(newFeeRate);
    if (currentStep === Step.Confirm) {
      setSendMax(false);
    }
  };

  return (
    <StepDisplay
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      recipientAddress={recipientAddress}
      setRecipientAddress={setRecipientAddress}
      amountSats={amountSats}
      setAmountSats={setAmountSats}
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
      summary={summary}
    />
  );
}

export default SendBtcScreen;
