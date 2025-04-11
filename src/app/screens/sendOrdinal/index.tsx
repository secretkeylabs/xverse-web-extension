import useAddressInscription from '@hooks/queries/ordinals/useAddressInscription';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useCancellableEffect from '@hooks/useCancellableEffect';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import {
  AnalyticsEvents,
  btcTransaction,
  type KeystoneTransport,
  type LedgerTransport,
} from '@secretkeylabs/xverse-core';
import { removeAccountAvatarAction } from '@stores/wallet/actions/actionCreators';
import { isInOptions } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import RoutePaths from 'app/routes/paths';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import StepDisplay from './stepDisplay';
import { getPreviousStep, Step } from './steps';

function SendOrdinalScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isInOption = isInOptions();

  const { id } = useParams();
  const { t } = useTranslation('translation');
  const [searchParams] = useSearchParams();
  const isRareSatParam = searchParams.get('isRareSat');
  const vout = searchParams.get('vout');
  const isRareSat = isRareSatParam === 'true';

  const context = useTransactionContext();
  const { data: selectedOrdinal } = useAddressInscription(isRareSat ? undefined : id);
  const selectedAccount = useSelectedAccount();
  const { avatarIds } = useWalletSelector();

  const selectedAvatar = avatarIds[selectedAccount.ordinalsAddress];
  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectRecipient);
  const [feeRate, setFeeRate] = useState('');

  const [recipientAddress, setRecipientAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();
  const [insufficientFundsError, setInsufficientFundsError] = useState(false);

  useResetUserFlow(RoutePaths.SendOrdinal);

  useEffect(() => {
    if (!selectedOrdinal && !isRareSat) {
      return;
    }
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(btcFeeRate.regular.toString());
    }
  }, [btcFeeRate, feeRatesLoading]);

  useEffect(() => {
    const recipient = searchParams.get('address');
    if (recipient) {
      setRecipientAddress(recipient);
    }
  }, [searchParams]);

  useCancellableEffect(
    async (isEffectActive) => {
      if (!recipientAddress || !feeRate) {
        setTransaction(undefined);
        setSummary(undefined);
        setInsufficientFundsError(false);
        return;
      }

      setIsLoading(true);
      setInsufficientFundsError(false);

      try {
        const transactionDetails = isRareSat
          ? await btcTransaction.sendOrdinals(
              context,
              [{ toAddress: recipientAddress, outpoint: `${id}:${vout}` }],
              Number(feeRate),
            )
          : await btcTransaction.sendOrdinalsWithSplit(
              context,
              [{ toAddress: recipientAddress, inscriptionId: id! }],
              Number(feeRate),
            );

        if (isEffectActive() && transactionDetails) {
          setTransaction(transactionDetails);
          setSummary(await transactionDetails.getSummary());
        }
      } catch (e) {
        if (!isEffectActive()) return;
        if (e instanceof Error) {
          if (e.message.includes('Insufficient funds')) {
            setInsufficientFundsError(true);
          } else {
            console.error(e);
          }
        }
        setTransaction(undefined);
        setSummary(undefined);
      } finally {
        if (isEffectActive()) setIsLoading(false);
      }
    },
    [context, recipientAddress, feeRate, id, vout, isRareSat],
  );

  if (!selectedOrdinal && !isRareSat) {
    navigate('/');
    return null;
  }

  const handleCancel = () => {
    if (isInOption) {
      navigate(
        isRareSat
          ? `/nft-dashboard/rare-sats-bundle`
          : `/nft-dashboard/ordinal-detail/${selectedOrdinal?.id}`,
      );
    } else {
      navigate(-1);
    }
  };

  const handleBackButtonClick = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep(currentStep));
    } else {
      handleCancel();
    }
  };

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const transactionDetails = isRareSat
      ? await btcTransaction.sendOrdinals(
          context,
          [{ toAddress: recipientAddress, outpoint: `${id}:${vout}` }],
          desiredFeeRate,
        )
      : await btcTransaction.sendOrdinalsWithSplit(
          context,
          [{ toAddress: recipientAddress, inscriptionId: id! }],
          desiredFeeRate,
        );

    if (!transactionDetails) return;
    const txSummary = await transactionDetails.getSummary();
    if (txSummary) return Number(txSummary.fee);
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
        protocol: 'ordinals',
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

      if (
        selectedAvatar?.type === 'inscription' &&
        selectedAvatar.inscription?.id === selectedOrdinal?.id
      ) {
        dispatch(removeAccountAvatarAction({ address: selectedAccount.ordinalsAddress }));
      }
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

  const handleFeeRateChange = (newFeeRate: string) => setFeeRate(newFeeRate);

  return (
    <StepDisplay
      summary={summary}
      ordinal={selectedOrdinal}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      recipientAddress={recipientAddress}
      setRecipientAddress={setRecipientAddress}
      insufficientFunds={insufficientFundsError}
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

export default SendOrdinalScreen;
