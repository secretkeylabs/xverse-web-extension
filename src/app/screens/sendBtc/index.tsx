import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useDebounce from '@hooks/useDebounce';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import { TransportWebUSB } from '@keystonehq/hw-transport-webusb';
import {
  AnalyticsEvents,
  btcTransaction,
  type AccountType,
  type Transport,
} from '@secretkeylabs/xverse-core';
import { isInOptions, isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  generateSendMaxTransaction,
  generateTransaction,
  type TransactionSummary,
} from './helpers';
import StepDisplay from './stepDisplay';
import { getPreviousStep, Step } from './steps';

function SendBtcScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation');

  const isInOption = isInOptions();

  useResetUserFlow('/send-btc');

  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const selectedAccount = useSelectedAccount();
  const transactionContext = useTransactionContext();
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
      setFeeRate(feeRate || btcFeeRate.regular.toString());
    }
  }, [btcFeeRate, feeRatesLoading]);

  const generateTransactionAndSummary = async (feeRateOverride?: number) => {
    const amountBigInt = Number.isNaN(Number(amountSats)) ? 0n : BigInt(amountSats);
    const result =
      sendMax && currentStep !== Step.Confirm
        ? await generateSendMaxTransaction(
            transactionContext,
            debouncedRecipient,
            feeRateOverride ?? +feeRate,
          )
        : await generateTransaction(
            transactionContext,
            debouncedRecipient,
            amountBigInt,
            feeRateOverride ?? +feeRate,
          );
    return result;
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
  }, [transactionContext, debouncedRecipient, amountSats, feeRate, sendMax]);

  const handleCancel = () => {
    if ((isLedgerAccount(selectedAccount) || isKeystoneAccount(selectedAccount)) && isInOption) {
      window.close();
      return;
    }
    navigate('/');
  };

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep));
    } else {
      handleCancel();
    }
  };

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const { summary: tempSummary } = await generateTransactionAndSummary(desiredFeeRate);
    if (tempSummary) return Number(tempSummary.fee);
    return undefined;
  };

  const handleSubmit = async (type?: AccountType, transport?: Transport | TransportWebUSB) => {
    try {
      setIsSubmitting(true);
      const txnId = await transaction?.broadcast({
        ...(type === 'ledger' && {
          ledgerTransport: transport as Transport,
        }),
        ...(type === 'keystone' && {
          keystoneTransport: transport as TransportWebUSB,
        }),
        selectedAccount,
        rbfEnabled: true,
      });

      trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
        protocol: 'bitcoin',
        action: 'transfer',
        wallet_type: selectedAccount.accountType || 'software',
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
      let msg = e;
      if (e instanceof Error) {
        if (e.message.includes('Export address is just allowed on specific pages')) {
          msg = t('SIGNATURE_REQUEST.KEYSTONE.CONFIRM.ERROR_SUBTITLE');
        }
        if (e.message.includes('UR parsing rejected')) {
          msg = t('SIGNATURE_REQUEST.KEYSTONE.CONFIRM.DENIED.ERROR_SUBTITLE');
        }
      }
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: `${msg}`,
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
      amountSats={amountSats}
      setAmountSats={setAmountSatsSafe}
      feeRate={feeRate}
      setFeeRate={handleFeeRateChange}
      getFeeForFeeRate={calculateFeeForFeeRate}
      sendMax={sendMax}
      setSendMax={setSendMax}
      onBack={handleBackButtonClick}
      onCancel={handleCancel}
      onConfirm={handleSubmit}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
    />
  );
}

export default SendBtcScreen;
