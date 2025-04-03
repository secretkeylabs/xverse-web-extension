import { useGetBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  BRC20ErrorCode,
  brc20TransferEstimateFees,
  CoreError,
  validateBtcAddress,
} from '@secretkeylabs/xverse-core';
import { isDangerFeedback, type InputFeedbackProps } from '@ui-library/inputFeedback';
import type { Brc20TransferEstimateFeesParams, ConfirmBrc20TransferState } from '@utils/brc20';
import { replaceCommaByDot } from '@utils/helper';
import { getFtTicker } from '@utils/tokens';
import RoutePaths from 'app/routes/paths';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import StepDisplay from './stepDisplay';
import { getPreviousStep, Step } from './steps';

function SendBrc20Screen() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND_BRC20' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { btcAddress, ordinalsAddress } = useSelectedAccount();
  const { network } = useWalletSelector();
  const { data: brc20CoinsList } = useGetBrc20FungibleTokens();
  const { data: feeRate } = useBtcFeeRate();
  const [amountToSend, setAmountToSend] = useState(location.state?.amount || '');
  const [amountError, setAmountError] = useState<InputFeedbackProps | null>(null);
  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress || '');
  const [recipientError, setRecipientError] = useState<InputFeedbackProps | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(
    location.state?.step !== undefined ? location.state.step : Step.SelectRecipient,
  );
  const transactionContext = useTransactionContext();

  useResetUserFlow(RoutePaths.SendBrc20OneStep);

  const principal = searchParams.get('principal');
  const fungibleToken = brc20CoinsList?.find((coin) => coin.principal === principal);

  const isNextEnabled =
    !isDangerFeedback(amountError) &&
    !isDangerFeedback(recipientError) &&
    !!recipientAddress &&
    amountToSend !== '';

  const handleCancel = () => {
    navigate(`/coinDashboard/FT?ftKey=${fungibleToken?.principal}&protocol=brc-20`);
  };

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep));
    } else {
      handleCancel();
    }
  };

  const validateAmount = (amountInput: string): boolean => {
    const amount = Number(replaceCommaByDot(amountInput));
    const balance = Number(fungibleToken?.balance);
    if (!Number.isFinite(amount) || amount === 0) {
      setAmountError({ variant: 'danger', message: t('ERRORS.AMOUNT_REQUIRED') });
      return false;
    }
    if (!Number.isFinite(balance) || amount > Number(balance)) {
      setAmountError({ variant: 'danger', message: t('ERRORS.INSUFFICIENT_BALANCE') });
      return false;
    }
    setAmountError(null);
    return true;
  };

  const validateRecipientAddress = (address: string): boolean => {
    if (!address) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ADDRESS_REQUIRED') });
      return false;
    }
    if (
      !validateBtcAddress({
        btcAddress: address,
        network: network.type,
      })
    ) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ADDRESS_INVALID') });
      return false;
    }
    if (address === ordinalsAddress || address === btcAddress) {
      setRecipientError({ variant: 'info', message: t('YOU_ARE_TRANSFERRING_TO_YOURSELF') });
      return true;
    }
    setRecipientError(null);
    return true;
  };

  useEffect(() => {
    if (location.state?.amount) {
      validateAmount(location.state.amount);
    }
    if (location.state?.recipientAddress) {
      validateRecipientAddress(location.state.recipientAddress);
    }
  }, [location.state]);

  useEffect(() => {
    const recipient = searchParams.get('address');
    if (recipient) {
      setRecipientAddress(recipient);
      validateRecipientAddress(recipient);
    }
  }, [searchParams]);

  // Validate recipient address when it changes
  useEffect(() => {
    if (recipientAddress) {
      validateRecipientAddress(recipientAddress);
    }
  }, [recipientAddress]);

  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    const resultRegex = /^\d*\.?\d*$/;
    if (resultRegex.test(newValue)) {
      validateAmount(newValue);
      setAmountToSend(newValue);
    }
  };

  const handleOnPressNext = async () => {
    try {
      if (
        !fungibleToken ||
        !validateAmount(amountToSend) ||
        !validateRecipientAddress(recipientAddress) ||
        !feeRate
      ) {
        return;
      }
      setProcessing(true);

      const ticker = getFtTicker(fungibleToken);
      const numberAmount = Number(replaceCommaByDot(amountToSend));
      const estimateFeesParams: Brc20TransferEstimateFeesParams = {
        tick: ticker,
        amount: numberAmount,
        revealAddress: ordinalsAddress,
        feeRate: feeRate?.regular,
      };
      const estimatedFees = await brc20TransferEstimateFees(estimateFeesParams, transactionContext);
      const state: ConfirmBrc20TransferState = {
        recipientAddress,
        estimateFeesParams,
        estimatedFees,
        token: fungibleToken,
      };
      navigate('/confirm-brc20-tx', { state });
    } catch (err) {
      const e = err as Error;
      if (
        CoreError.isCoreError(e) &&
        (e.code ?? '') in BRC20ErrorCode &&
        e.code === BRC20ErrorCode.INSUFFICIENT_FUNDS
      ) {
        setAmountError({ variant: 'danger', message: t('ERRORS.INSUFFICIENT_BALANCE_FEES') });
      } else {
        setAmountError({ variant: 'danger', message: t('ERRORS.SERVER_ERROR') });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSetCurrentStep = (step: Step) => {
    if (step === Step.Confirm) {
      return handleOnPressNext();
    }

    setCurrentStep(step);
  };

  if (!fungibleToken) {
    navigate('/');
    return null;
  }

  return (
    <StepDisplay
      token={fungibleToken}
      amountToSend={amountToSend}
      onAmountChange={onInputChange}
      amountError={amountError}
      currentStep={currentStep}
      setCurrentStep={handleSetCurrentStep}
      recipientAddress={recipientAddress}
      setRecipientAddress={setRecipientAddress}
      onBack={handleBackButtonClick}
      isLoading={false}
      isNextEnabled={isNextEnabled}
      processing={processing}
    />
  );
}

export default SendBrc20Screen;
