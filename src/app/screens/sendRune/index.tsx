import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useHasFeature from '@hooks/useHasFeature';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  AnalyticsEvents,
  FungibleToken,
  RuneSummary,
  Transport,
  btcTransaction,
  parseSummaryForRunes,
} from '@secretkeylabs/xverse-core';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import { getFtBalance } from '@utils/tokens';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateTransaction, type TransactionSummary } from './helpers';
import StepDisplay from './stepDisplay';
import { Step, getPreviousStep } from './steps';

function SendRuneScreen() {
  const navigate = useNavigate();
  const isInOption = isInOptions();

  useResetUserFlow('/send-rune');

  const location = useLocation();
  const { t } = useTranslation('translation');
  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const selectedAccount = useSelectedAccount();
  const { network } = useWalletSelector();
  const { data: runesCoinsList } = useRuneFungibleTokensQuery();
  const context = useTransactionContext();
  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress || '');
  const [amountError, setAmountError] = useState('');
  const [amountToSend, setAmountToSend] = useState<string>(location.state?.amount || '');
  const [feeRate, setFeeRate] = useState('');
  const [sendMax, setSendMax] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectRecipient);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const transactionContext = useTransactionContext();
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();
  const [runeSummary, setRuneSummary] = useState<RuneSummary | undefined>();

  const coinTicker = location.search
    ? decodeURIComponent(location.search.split('coinTicker=')[1])
    : undefined;
  const fungibleToken: FungibleToken =
    location.state?.fungibleToken || runesCoinsList?.find((coin) => coin.name === coinTicker);
  const hasRunesSupport = useHasFeature('RUNES_SUPPORT');

  useEffect(() => {
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(btcFeeRate.regular.toString());
    }
  }, [btcFeeRate, feeRatesLoading]);

  const generateTransactionAndSummary = async (feeRateOverride?: number) => {
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

  useEffect(() => {
    const bigAmount = BigNumber(amountToSend);

    if (!recipientAddress || !feeRate || bigAmount.isNaN() || bigAmount.isLessThanOrEqualTo(0)) {
      setTransaction(undefined);
      setSummary(undefined);
      setRuneSummary(undefined);
      return;
    }

    // This effect can be slow to compute as it signs transactions, but
    // it can also be very fast if there is not enough rune balance
    // this can lead to a race condition where entering an amount to send
    // with enough balance followed by a high balance will cause the first
    // event to finish after the one with insufficient funds, and it will inject the
    // incorrect state. This boolean will prevent the effect from setting the state
    // if it finishes after the value has changed
    let isActiveEffect = true;
    const generateTxnAndSummary = async () => {
      setIsLoading(true);
      try {
        const transactionDetails = await generateTransactionAndSummary();
        if (!isActiveEffect) return;
        setTransaction(transactionDetails.transaction);
        if (transactionDetails.summary) {
          setSummary(transactionDetails.summary);
          setRuneSummary(
            await parseSummaryForRunes(context, transactionDetails.summary, network.type),
          );
        }
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
  }, [transactionContext, recipientAddress, amountToSend, feeRate, sendMax]);

  const handleCancel = () => {
    if (isLedgerAccount(selectedAccount) && isInOption) {
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
      token={fungibleToken}
      summary={summary}
      runeSummary={runeSummary}
      amountToSend={amountToSend}
      setAmountToSend={setAmount}
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
