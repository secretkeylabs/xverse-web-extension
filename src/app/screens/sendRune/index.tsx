import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useAsyncFn from '@hooks/useAsyncFn';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useHasFeature from '@hooks/useHasFeature';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import {
  AnalyticsEvents,
  FeatureId,
  btcTransaction,
  type KeystoneTransport,
  type LedgerTransport,
} from '@secretkeylabs/xverse-core';
import { trackMixPanel } from '@utils/mixpanel';
import { getFtBalance } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { generateTransaction, type TransactionSummary } from './helpers';
import StepDisplay from './stepDisplay';
import { Step, getPreviousStep } from './steps';

function SendRuneScreen() {
  const navigate = useNavigate();

  useResetUserFlow('/send-rune');

  const location = useLocation();
  const { t } = useTranslation('translation');
  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const selectedAccount = useSelectedAccount();
  const { data: runesCoinsList } = useRuneFungibleTokensQuery();
  // TODO: can we remove location.state here?
  const [recipientAddress, setRecipientAddress] = useState<string>(
    location.state?.recipientAddress,
  );
  const [amountError, setAmountError] = useState('');
  const [amountToSend, setAmountToSend] = useState<string>(location.state?.amount || '');
  const [useTokenValue, setUseTokenValue] = useState(true);
  const [feeRate, setFeeRate] = useState('');
  const [sendMax, setSendMax] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectRecipient);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const transactionContext = useTransactionContext();
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();
  const [searchParams] = useSearchParams();
  const hasRunesSupport = useHasFeature(FeatureId.RUNES_SUPPORT);

  const principal = searchParams.get('principal');
  const fungibleToken = runesCoinsList?.find((coin) => coin.principal === principal);

  useEffect(() => {
    if (!fungibleToken) {
      return;
    }
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(btcFeeRate.regular.toString());
    }
  }, [btcFeeRate, feeRatesLoading]);

  const generateTransactionAndSummary = async (feeRateOverride?: number) => {
    if (!fungibleToken) {
      return;
    }
    const balance = BigNumber(getFtBalance(fungibleToken));
    const decimalsToBase = BigNumber(10 ** (fungibleToken.decimals || 0));

    // get real balance after accounting for rune divisibility
    const realBalance = balance.multipliedBy(decimalsToBase);
    const realAmountToSend = BigNumber(amountToSend || 0).multipliedBy(decimalsToBase);

    if (realBalance.isLessThan(realAmountToSend)) {
      setAmountError(t('SEND.ERRORS.INSUFFICIENT_BALANCE'));
    } else {
      setAmountError('');
    }
    return generateTransaction(
      transactionContext,
      fungibleToken.name,
      recipientAddress,
      sendMax ? BigInt(realBalance.toFixed()) : BigInt(realAmountToSend.toFixed()),
      feeRateOverride ?? +feeRate,
    );
  };

  const { isLoading } = useAsyncFn(
    async ({ signal }) => {
      const bigAmount = BigNumber(amountToSend);

      if (!recipientAddress || !feeRate || bigAmount.isNaN() || bigAmount.isLessThanOrEqualTo(0)) {
        setTransaction(undefined);
        setSummary(undefined);
        return;
      }

      try {
        const transactionDetails = await generateTransactionAndSummary();
        if (!signal.aborted && transactionDetails) {
          setTransaction(transactionDetails.transaction);
          if (transactionDetails.summary) {
            setSummary(transactionDetails.summary);
          }
        }
      } catch (e) {
        if (signal.aborted) return;
        if (
          !(e instanceof Error) ||
          !(
            e.message.toLowerCase().includes('not enough runes to send') ||
            e.message.toLowerCase().includes('insufficient funds')
          )
        ) {
          console.error(e);
          throw e;
        }
        setTransaction(undefined);
        setSummary(undefined);
      }
    },
    [transactionContext, recipientAddress, amountToSend, feeRate, sendMax],
  );

  if (!fungibleToken) {
    navigate('/');
    return null;
  }

  const handleCancel = () => {
    navigate(
      `/coinDashboard/FT?ftKey=${fungibleToken.principal}&protocol=${fungibleToken.protocol}`,
    );
  };

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep));
    } else {
      handleCancel();
    }
  };

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const transactionDetails = await generateTransactionAndSummary(desiredFeeRate);
    if (!transactionDetails) return;

    const { summary: tempSummary } = transactionDetails;
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
        protocol: 'runes',
        action: 'transfer',
        wallet_type: selectedAccount?.accountType || 'software',
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
      console.error(e);
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

  const setAmount = (newAmount: string) => {
    if (!Number.isNaN(+newAmount)) {
      setAmountToSend(newAmount);
    }
  };

  if (!hasRunesSupport) {
    navigate('/');
    return null;
  }

  return (
    <StepDisplay
      summary={summary}
      token={fungibleToken}
      amountToSend={amountToSend}
      setAmountToSend={setAmount}
      useTokenValue={useTokenValue}
      setUseTokenValue={setUseTokenValue}
      amountError={amountError}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      recipientAddress={recipientAddress}
      setRecipientAddress={setRecipientAddress}
      feeRate={feeRate}
      setFeeRate={handleFeeRateChange}
      sendMax={sendMax}
      setSendMax={setSendMax}
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
