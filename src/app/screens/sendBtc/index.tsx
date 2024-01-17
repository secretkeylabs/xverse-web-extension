import BottomBar from '@components/tabBar';
import TokenImage from '@components/tokenImage';
import TopRow from '@components/topRow';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useTransactionContext from '@hooks/useTransactionContext';
import { Transport, btcTransaction } from '@secretkeylabs/xverse-core';
import { isInOptions } from '@utils/helper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  generateSendMaxTransaction,
  generateTransaction,
  type TransactionSummary,
} from './helpers';
import StepDisplay from './stepDisplay';
import { Step, getPreviousStep } from './steps';

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0;
`;

const Title = styled.div`
  ${(props) => props.theme.typography.headline_xs}
  margin-top: ${(props) => props.theme.spacing(6)}px;
  margin-bottom: ${(props) => props.theme.spacing(12)}px;
`;

function SendBtcScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();

  useResetUserFlow('/send-btc');

  const location = useLocation();

  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();

  // TODO: remove amount and address defaults, set fee rate to regular
  const [recipientAddress, setRecipientAddress] = useState(
    location.state?.recipientAddress || '2ND4zw8hbn1ydvVwZFo6UjCRWr394b71okg',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [amountSats, setAmountSats] = useState(location.state?.amount || '10000');
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
    const transactionDetails = sendMax
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
    navigate('/');
  };

  const showNavButtons = !isInOptions() || currentStep > 0;

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

  return (
    <>
      {currentStep !== Step.Confirm && (
        <>
          <TopRow title="" onClick={handleBackButtonClick} showBackButton={showNavButtons} />
          <TitleContainer>
            <TokenImage token="BTC" loading={false} />
            <Title>{t('SEND')}</Title>
          </TitleContainer>
        </>
      )}
      <StepDisplay
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        recipientAddress={recipientAddress}
        setRecipientAddress={setRecipientAddress}
        amountSats={amountSats}
        setAmountSats={setAmountSats}
        feeRate={feeRate}
        setFeeRate={setFeeRate}
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
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBtcScreen;
