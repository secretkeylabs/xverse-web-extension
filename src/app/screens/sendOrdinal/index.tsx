import useAddressInscription from '@hooks/queries/ordinals/useAddressInscription';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import useWalletSelector from '@hooks/useWalletSelector';
import { TransportWebUSB } from '@keystonehq/hw-transport-webusb';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import {
  AnalyticsEvents,
  btcTransaction,
  type AccountType,
  type Transport,
} from '@secretkeylabs/xverse-core';
import { removeAccountAvatarAction } from '@stores/wallet/actions/actionCreators';
import { isInOptions, isLedgerAccount } from '@utils/helper';
import { trackMixPanel } from '@utils/mixpanel';
import RoutePaths from 'app/routes/paths';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StepDisplay from './stepDisplay';
import { getPreviousStep, Step } from './steps';

function SendOrdinalScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isInOption = isInOptions();

  const location = useLocation();
  const { id } = useParams();
  const params = new URLSearchParams(location.search);
  const isRareSatParam = params.get('isRareSat');
  const vout = params.get('vout');
  const isRareSat = isRareSatParam === 'true';
  const fromRune = params.get('fromRune');

  const context = useTransactionContext();
  const { data: selectedOrdinal } = useAddressInscription(isRareSat ? undefined : id);
  const selectedAccount = useSelectedAccount();
  const { avatarIds } = useWalletSelector();
  const currentAvatar = avatarIds[selectedAccount.btcAddress];
  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();
  const [currentStep, setCurrentStep] = useState<Step>(Step.SelectRecipient);
  const [feeRate, setFeeRate] = useState('');

  const [recipientAddress, setRecipientAddress] = useState<string>(
    location.state?.recipientAddress ?? '',
  );

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
    if (!recipientAddress || !feeRate) {
      setTransaction(undefined);
      setSummary(undefined);
      setInsufficientFundsError(false);
      return;
    }
    let isActiveEffect = true;
    const generateTxnAndSummary = async () => {
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

        if (!isActiveEffect) return;
        if (!transactionDetails) return;
        setTransaction(transactionDetails);
        setSummary(await transactionDetails.getSummary());
      } catch (e) {
        if (e instanceof Error) {
          // don't log the error if it's just an insufficient funds error
          if (e.message.includes('Insufficient funds')) {
            setInsufficientFundsError(true);
          } else {
            console.error(e);
          }
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

  if (!selectedOrdinal && !isRareSat) {
    navigate('/');
    return null;
  }

  const handleCancel = () => {
    if (isLedgerAccount(selectedAccount) && isInOption) {
      window.close();
      return;
    }
    navigate(-1);
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
          browserTx: isInOption,
        },
      });

      if (
        currentAvatar?.type === 'inscription' &&
        currentAvatar.inscription?.id === selectedOrdinal?.id
      ) {
        dispatch(removeAccountAvatarAction({ address: selectedAccount.btcAddress }));
      }
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
