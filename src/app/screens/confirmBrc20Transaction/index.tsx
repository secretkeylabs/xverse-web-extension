import InfoContainer from '@components/infoContainer';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useDebounce from '@hooks/useDebounce';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import type { BRC20ErrorCode } from '@secretkeylabs/xverse-core';
import {
  AnalyticsEvents,
  brc20TransferEstimateFees,
  getBtcFiatEquivalent,
  useBrc20TransferFees,
  validateBtcAddressIsTaproot,
} from '@secretkeylabs/xverse-core';
import SelectFeeRate from '@ui-components/selectFeeRate';
import Button from '@ui-library/button';
import Callout, { type CalloutProps } from '@ui-library/callout';
import {
  getFeeValuesForBrc20OneStepTransfer,
  type ConfirmBrc20TransferState,
  type ExecuteBrc20TransferState,
} from '@utils/brc20';
import { isInOptions } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import RoutePaths from 'app/routes/paths';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Brc20FeesComponent from './brc20FeesComponent';
import {
  ButtonContainer,
  Container,
  ErrorContainer,
  ErrorText,
  FeeContainer,
  OuterContainer,
  RecipientCardContainer,
  ReviewTransactionText,
  ScrollContainer,
  StyledCallouts,
  Subtitle,
} from './index.styled';
import RecipientCard, { type RecipientCardProps } from './recipientCard';

function ConfirmBrc20Transaction() {
  /* hooks */
  const { t } = useTranslation('translation');
  const { network, fiatCurrency, feeMultipliers } = useWalletSelector();
  const selectedAccount = useSelectedAccount();
  const { btcAddress, ordinalsAddress } = selectedAccount;
  const { btcFiatRate } = useSupportedCoinRates();
  const navigate = useNavigate();
  const {
    recipientAddress,
    estimateFeesParams,
    estimatedFees: initEstimatedFees,
    token,
  }: ConfirmBrc20TransferState = useLocation().state;
  const transactionContext = useTransactionContext();
  const { data: recommendedFees } = useBtcFeeRate();

  useResetUserFlow('/confirm-brc20-tx');

  /* state */
  const [showFeeWarning, setShowFeeWarning] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [userInputFeeRate, setUserInputFeeRate] = useState(estimateFeesParams.feeRate.toString());
  const [error, setError] = useState<BRC20ErrorCode | ''>('');

  const {
    commitValueBreakdown,
    isLoading: isFeeLoading,
    errorCode,
  } = useBrc20TransferFees({
    ...estimateFeesParams,
    feeRate: Number(userInputFeeRate),
    skipInitialFetch: false,
    context: transactionContext,
  });

  const { txFee, inscriptionFee, totalFee, transferUtxoValue } =
    getFeeValuesForBrc20OneStepTransfer(commitValueBreakdown ?? initEstimatedFees.valueBreakdown);

  useEffect(() => {
    if (feeMultipliers && txFee.isGreaterThan(new BigNumber(feeMultipliers.thresholdHighSatsFee))) {
      setShowFeeWarning(true);
    } else if (showFeeWarning) {
      setShowFeeWarning(false);
    }
  }, [txFee, feeMultipliers]);

  /* callbacks */
  const handleClickConfirm = () => {
    setIsConfirmLoading(true);
    // validate brc20 balance again here
    if (estimateFeesParams.amount > Number(token.balance)) {
      setError(t('CONFIRM_BRC20.ERRORS.INSUFFICIENT_BALANCE'));
      return;
    }
    const state: ExecuteBrc20TransferState = {
      recipientAddress,
      estimateFeesParams: {
        ...estimateFeesParams,
        feeRate: Number(userInputFeeRate),
      },
      token,
    };
    trackMixPanel(AnalyticsEvents.TransactionConfirmed, {
      protocol: 'brc20',
      action: 'transfer',
      wallet_type: selectedAccount?.accountType || 'software',
    });
    navigate('/execute-brc20-tx', { state });
    setIsConfirmLoading(false);
  };

  const errorMessage = errorCode ? t(`CONFIRM_BRC20.ERROR_CODES.${errorCode}`) : error;

  const recipient: RecipientCardProps = {
    address: recipientAddress,
    amountBrc20: new BigNumber(estimateFeesParams.amount),
    amountSats: new BigNumber(transferUtxoValue),
    fungibleToken: token,
  };

  const callouts: CalloutProps[] = [];
  if (!validateBtcAddressIsTaproot(recipientAddress)) {
    callouts.push({
      variant: 'info',
      bodyText: t('SEND_BRC20.MAKE_SURE_THE_RECIPIENT'),
    });
  }
  if (recipientAddress === ordinalsAddress || recipientAddress === btcAddress) {
    callouts.push({
      variant: 'info',
      bodyText: t('SEND_BRC20.YOU_ARE_TRANSFERRING_TO_YOURSELF'),
    });
  }

  const handleGoBack = () => {
    trackMixPanel(AnalyticsEvents.InitiateSendFlow, {
      selectedToken: token.principal,
      source: 'send_brc20',
    });
    navigate(`${RoutePaths.SendBrc20OneStep}?principal=${token.principal}`, {
      state: {
        amount: estimateFeesParams.amount.toString(),
        recipientAddress,
        step: 1,
      },
    });
  };

  const handleClickCancel = () => {
    navigate(`/coinDashboard/FT?ftKey=${token.principal}&protocol=brc-20`);
  };

  const getFeeForFeeRate = async (feeRate) => {
    const estimatedFees = await brc20TransferEstimateFees(
      { ...estimateFeesParams, feeRate },
      transactionContext,
    );
    const { txFee: newTxFee } = getFeeValuesForBrc20OneStepTransfer(estimatedFees.valueBreakdown);
    return newTxFee.toNumber();
  };

  return (
    <>
      <TopRow onClick={handleGoBack} />
      <ScrollContainer>
        <OuterContainer>
          <Container>
            {showFeeWarning && (
              <InfoContainer
                type="Warning"
                bodyText={t('CONFIRM_TRANSACTION.HIGH_FEE_WARNING_TEXT')}
              />
            )}

            <ReviewTransactionText>
              {t('CONFIRM_TRANSACTION.REVIEW_TRANSACTION')}
            </ReviewTransactionText>
            {callouts?.length > 0 && (
              <StyledCallouts>
                {callouts.map((callout) => (
                  <Callout key={callout.bodyText as string} {...callout} />
                ))}
              </StyledCallouts>
            )}

            <Subtitle>{t('CONFIRM_TRANSACTION.YOU_WILL_SEND')}</Subtitle>

            <RecipientCardContainer>
              <RecipientCard
                address={recipient.address}
                amountBrc20={recipient.amountBrc20}
                amountSats={recipient.amountSats}
                fungibleToken={recipient.fungibleToken}
              />
            </RecipientCardContainer>

            <Subtitle>{t('CONFIRM_TRANSACTION.TRANSACTION_DETAILS')}</Subtitle>

            <TransactionDetailComponent
              title={t('CONFIRM_TRANSACTION.NETWORK')}
              value={network.type}
            />

            <Subtitle>{t('CONFIRM_TRANSACTION.FEES')}</Subtitle>

            <FeeContainer>
              <Brc20FeesComponent
                label={t('CONFIRM_TRANSACTION.INSCRIPTION_SERVICE_FEE')}
                value={inscriptionFee}
                suffix="sats"
                fiatValue={getBtcFiatEquivalent(inscriptionFee, BigNumber(btcFiatRate))}
                fiatCurrency={fiatCurrency}
              />
              {recommendedFees && (
                <SelectFeeRate
                  fee={txFee.toString()}
                  feeUnits="sats"
                  feeRate={userInputFeeRate}
                  feeRateUnits="sats/vB"
                  setFeeRate={(newFeeRate) => setUserInputFeeRate(newFeeRate)}
                  baseToFiat={(amount) =>
                    getBtcFiatEquivalent(new BigNumber(amount), BigNumber(btcFiatRate)).toString()
                  }
                  fiatUnit={fiatCurrency}
                  getFeeForFeeRate={getFeeForFeeRate}
                  feeRates={{
                    medium: recommendedFees.regular,
                    high: recommendedFees.priority,
                  }}
                  feeRateLimits={recommendedFees.limits}
                  isLoading={isFeeLoading}
                  amount={estimateFeesParams.amount}
                />
              )}
              <Brc20FeesComponent
                label={t('CONFIRM_TRANSACTION.TOTAL_FEES')}
                value={totalFee}
                suffix="sats"
                fiatValue={getBtcFiatEquivalent(totalFee, BigNumber(btcFiatRate))}
                fiatCurrency={fiatCurrency}
              />
            </FeeContainer>

            {errorMessage && (
              <ErrorContainer>
                <ErrorText>{errorMessage}</ErrorText>
              </ErrorContainer>
            )}
          </Container>
        </OuterContainer>
        <ButtonContainer>
          <Button
            title={t('CONFIRM_TRANSACTION.CANCEL')}
            variant="secondary"
            onClick={handleClickCancel}
            disabled={isConfirmLoading || isFeeLoading}
          />
          <Button
            title={t('CONFIRM_TRANSACTION.CONFIRM')}
            disabled={isConfirmLoading || isFeeLoading}
            loading={isConfirmLoading}
            onClick={handleClickConfirm}
          />
        </ButtonContainer>

        {!isInOptions() && <BottomBar tab="dashboard" />}
      </ScrollContainer>
    </>
  );
}

export default ConfirmBrc20Transaction;
