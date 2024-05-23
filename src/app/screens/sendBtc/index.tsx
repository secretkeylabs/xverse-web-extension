import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useDebounce from '@hooks/useDebounce';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { AnalyticsEvents, btcTransaction, Transport } from '@secretkeylabs/xverse-core';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  generateSendMaxTransaction,
  generateTransaction,
  type TransactionSummary,
} from './helpers';
import StepDisplay from './stepDisplay';
import { getPreviousStep, Step } from './steps';

function SendBtcScreen() {
  const navigate = useNavigate();

  const isInOption = isInOptions();

  useResetUserFlow('/send-btc');

  const location = useLocation();

  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const { selectedAccount } = useWalletSelector();
  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountSats, setAmountSats] = useState(location.state?.amount || '');
  const [feeRate, setFeeRate] = useState('');
  const [sendMax, setSendMax] = useState(false);
  const amountEditable = location.state?.disableAmountEdit ?? true;
  const addressEditable = location.state?.disableAddressEdit ?? true;

  const debouncedRecipient = useDebounce(recipientAddress, 500);

  const initialStep = addressEditable
    ? Step.SelectRecipient
    : amountEditable
    ? Step.SelectRecipient
    : Step.Confirm;

  const [currentStep, setCurrentStep] = useState<Step>(initialStep);

  const transactionContext = useTransactionContext();
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();

  useEffect(() => {
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(btcFeeRate.regular.toString());
    }
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
        if (!(e instanceof Error) || !e.message.includes('Insufficient funds')) {
          // don't log the error if it's just an insufficient funds error
          console.error(e);
        }

        setTransaction(undefined);
        setSummary(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    generateTxnAndSummary();
  }, [transactionContext, debouncedRecipient, amountSats, feeRate, sendMax]);

  const handleCancel = () => {
    if (isLedgerAccount(selectedAccount) && isInOption) {
      window.close();
      return;
    }
    navigate('/');
  };

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep, addressEditable, amountEditable));
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
      const txnId = await transaction?.broadcast({ ledgerTransport, rbfEnabled: true });

      trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
        protocol: 'bitcoin',
        action: 'transfer',
        wallet_type: selectedAccount?.accountType || 'software',
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
      addressEditable={addressEditable}
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
