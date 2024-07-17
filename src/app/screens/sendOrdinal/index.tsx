import useAddressInscription from '@hooks/queries/ordinals/useAddressInscription';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import { AnalyticsEvents, type Transport, btcTransaction } from '@secretkeylabs/xverse-core';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StepDisplay from './stepDisplay';
import { Step, getPreviousStep } from './steps';

function SendRuneScreen() {
  const navigate = useNavigate();
  const isInOption = isInOptions();

  const context = useTransactionContext();
  const location = useLocation();
  const { id } = useParams();
  const { data: selectedOrdinal } = useAddressInscription(id!);
  const selectedAccount = useSelectedAccount();
  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectRecipient);
  const [feeRate, setFeeRate] = useState('');

  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress ?? '');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();

  useResetUserFlow('/send-ordinal');

  useEffect(() => {
    if (!selectedOrdinal) {
      return;
    }
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(btcFeeRate.regular.toString());
    }
  }, [btcFeeRate, feeRatesLoading]);

  useEffect(() => {
    if (!recipientAddress || !feeRate) {
      setTransaction(undefined);
      setSummary(undefined);
      return;
    }
    let isActiveEffect = true;
    const generateTxnAndSummary = async () => {
      setIsLoading(true);
      try {
        const transactionDetails = await btcTransaction.sendOrdinalsWithSplit(
          context,
          [{ toAddress: recipientAddress, inscriptionId: id! }],
          Number(feeRate),
        );
        if (!isActiveEffect) return;
        if (!transactionDetails) return;
        setTransaction(transactionDetails);
        setSummary(await transactionDetails.getSummary());
      } catch (e) {
        if (!(e instanceof Error) || !e.message.includes('Insufficient funds')) {
          // don't log the error if it's just an insufficient funds error
          console.error(e);
        }
        setTransaction(undefined);
        setSummary(undefined);
      } finally {
        if (isActiveEffect) {
          setIsLoading(false);
        }
      }
    };
    generateTxnAndSummary();
    return () => {
      isActiveEffect = false;
    };
  }, [context, recipientAddress, feeRate, id]);

  if (!selectedOrdinal) {
    navigate('/');
    return null;
  }

  const handleCancel = () => {
    if (isLedgerAccount(selectedAccount) && isInOption) {
      window.close();
      return;
    }
    navigate(`/nft-dashboard/ordinal-detail/${selectedOrdinal?.id}`);
  };

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep));
    } else {
      handleCancel();
    }
  };

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const transactionDetails = await btcTransaction.sendOrdinalsWithSplit(
      context,
      [{ toAddress: recipientAddress, inscriptionId: id! }],
      desiredFeeRate,
    );
    if (!transactionDetails) return;
    const txSummary = await transactionDetails.getSummary();
    if (txSummary) return Number(txSummary.fee);
    return undefined;
  };

  const handleSubmit = async (ledgerTransport?: Transport) => {
    try {
      setIsSubmitting(true);
      const txnId = await transaction?.broadcast({ ledgerTransport, rbfEnabled: true });

      trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
        protocol: 'runes',
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

  const handleFeeRateChange = (newFeeRate: string) => setFeeRate(newFeeRate);

  return (
    <StepDisplay
      ordinal={selectedOrdinal}
      summary={summary}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      recipientAddress={recipientAddress}
      setRecipientAddress={setRecipientAddress}
      feeRate={feeRate}
      setFeeRate={handleFeeRateChange}
      getFeeForFeeRate={calculateFeeForFeeRate}
      onBack={handleBackButtonClick}
      onCancel={handleCancel}
      onConfirm={handleSubmit}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
    />
  );
}

export default SendRuneScreen;
