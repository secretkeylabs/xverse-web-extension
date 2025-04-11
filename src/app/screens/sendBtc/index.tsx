import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useCancellableEffect from '@hooks/useCancellableEffect';
import useCanUserSwitchPaymentType from '@hooks/useCanUserSwitchPaymentType';
import useDebounce from '@hooks/useDebounce';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AnalyticsEvents,
  btcTransaction,
  type KeystoneTransport,
  type LedgerTransport,
} from '@secretkeylabs/xverse-core';
import { trackMixPanel } from '@utils/mixpanel';
import RoutePaths from 'app/routes/paths';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  generateSendMaxTransaction,
  generateTransaction,
  type TransactionSummary,
} from './helpers';
import StepDisplay from './stepDisplay';
import { Step } from './steps';

function SendBtcScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation');

  useResetUserFlow(RoutePaths.SendBtc);

  const { selectedAccountType, btcPaymentAddressType } = useWalletSelector();
  const [overridePaymentType, setOverridePaymentType] = useState(btcPaymentAddressType);

  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const transactionContext = useTransactionContext(overridePaymentType);
  const userCanSwitchPayType = useCanUserSwitchPaymentType();

  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountSats, setAmountSats] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [sendMax, setSendMax] = useState(false);
  const [searchParams] = useSearchParams();

  const debouncedRecipient = useDebounce(recipientAddress, 500);

  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectRecipient);

  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();

  useEffect(() => {
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(feeRate || btcFeeRate.regular.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- specifically don't care if feeRate changes
  }, [btcFeeRate, feeRatesLoading]);

  useEffect(() => {
    const recipient = searchParams.get('address');
    if (recipient) {
      setRecipientAddress(recipient);
    }
  }, [searchParams]);

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

  useCancellableEffect(
    async (isEffectActive) => {
      if (!debouncedRecipient || !feeRate) {
        setTransaction(undefined);
        setSummary(undefined);
        return;
      }

      setIsLoading(true);
      try {
        const transactionDetails = await generateTransactionAndSummary();

        if (isEffectActive()) {
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
        }
      } catch (e) {
        if (!isEffectActive()) return;
        if (!(e instanceof Error) || !e.message.includes('Insufficient funds')) {
          console.error(e);
        }
        setTransaction(undefined);
        setSummary(undefined);
      } finally {
        if (isEffectActive()) setIsLoading(false);
      }
    },
    [transactionContext, debouncedRecipient, amountSats, feeRate, sendMax],
  );

  const handleCancel = () => {
    navigate(`/coinDashboard/BTC`);
  };

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const { summary: tempSummary } = await generateTransactionAndSummary(desiredFeeRate);
    if (tempSummary) return Number(tempSummary.fee);
    return undefined;
  };

  const handleSubmit = async (options?: {
    ledgerTransport?: LedgerTransport;
    keystoneTransport?: KeystoneTransport;
  }) => {
    try {
      setIsSubmitting(true);
      const txnId = await transaction?.broadcast({
        ...options,
        rbfEnabled: true,
      });

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
          browserTx: false,
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
          browserTx: false,
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
