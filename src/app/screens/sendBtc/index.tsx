import BottomBar from '@components/tabBar';
import TokenImage from '@components/tokenImage';
import TopRow from '@components/topRow';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useTransactionContext from '@hooks/useTransactionContext';
import { btcTransaction } from '@secretkeylabs/xverse-core';
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

const Container = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  padding: 0 16px;
  margin-top: 16px;
  overflow-y: auto;
`;

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

  // TODO: remove amount and address defaults, set fee rate to regular
  // TODO: crashes if amount is set to 1
  const [recipientAddress, setRecipientAddress] = useState(
    location.state?.recipientAddress || '2N3J2uER8xjdNCpBfaA7K4kWpg9EbJfwfUu',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [amountSats, setAmountSats] = useState(location.state?.amount || '10000');
  const [feeRate, setFeeRate] = useState('10');
  const [sendMax, setSendMax] = useState(false);
  const amountEditable = location.state?.disableAmountEdit ?? true;

  const [currentStep, setCurrentStep] = useState<Step>(0);

  const transactionContext = useTransactionContext();
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();

  useEffect(() => {
    // TODO: validate properly
    if (!recipientAddress || !amountSats || !feeRate) {
      setTransaction(undefined);
      setSummary(undefined);
      return;
    }

    const amountBigInt = BigInt(amountSats);

    const generateTxnAndSummary = async () => {
      setIsLoading(true);
      try {
        const transactionDetails = sendMax
          ? await generateSendMaxTransaction(transactionContext, recipientAddress, +feeRate)
          : await generateTransaction(transactionContext, recipientAddress, amountBigInt, +feeRate);

        setTransaction(transactionDetails.transaction);

        setSummary(transactionDetails.summary);

        if (sendMax) {
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

  const showNavButtons = !isInOptions();

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep, amountEditable));
    } else {
      handleCancel();
    }
  };

  const calculateFeeForFeeRate = async (
    desiredFeeRate: number,
    useEffectiveFeeRate?: boolean,
  ): Promise<number> => {
    if (!transaction) {
      return 0;
    }

    transaction.feeRate = desiredFeeRate;

    try {
      const tempSummary = await transaction.getSummary({ useEffectiveFeeRate });
      return Number(tempSummary.fee);
    } finally {
      transaction.feeRate = +feeRate;
    }
  };

  const handleSubmit = async () => {
    // TODO: validate, set loading, error handling, redirect to txn confirmation screen
    await transaction?.broadcast();
    navigate('/');
  };

  return (
    <>
      <Container>
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
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default SendBtcScreen;
