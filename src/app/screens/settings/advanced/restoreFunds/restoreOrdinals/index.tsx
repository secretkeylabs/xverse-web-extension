import ActionButton from '@components/button';
import ConfirmBtcTransaction from '@components/confirmBtcTransaction';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useTransactionContext from '@hooks/useTransactionContext';
import { TransportWebUSB } from '@keystonehq/hw-transport-webusb';
import type { TransactionSummary } from '@screens/sendBtc/helpers';
import {
  type AccountType,
  AnalyticsEvents,
  type BtcOrdinal,
  btcTransaction,
  type Transport,
} from '@secretkeylabs/xverse-core';
import Spinner from '@ui-library/spinner';
import { trackMixPanel } from '@utils/mixpanel';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import OrdinalRow from './ordinalRow';

const RestoreFundTitle = styled.h1((props) => ({
  ...props.theme.typography.body_l,
  marginBottom: 32,
  color: props.theme.colors.white_200,
}));

const ErrorContainer = styled.div({
  display: 'flex',
  flex: 1,
  alignItems: 'flex-end',
});

const Container = styled.div({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginLeft: 16,
  marginTop: 32,
  marginRight: 16,
});

const LoaderContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const ErrorText = styled.h1((props) => ({
  ...props.theme.typography.body_s,
  marginBottom: 20,
  color: props.theme.colors.feedback.error,
}));

const ButtonContainer = styled.div({
  marginBottom: 32,
  flex: 1,
  display: 'flex',
  alignItems: 'flex-end',
});

function RestoreOrdinals() {
  const { t } = useTranslation('translation');
  const selectedAccount = useSelectedAccount();
  const { ordinalsAddress, btcAddress } = selectedAccount;
  const navigate = useNavigate();
  const ordinalsQuery = useOrdinalsByAddress(btcAddress);
  const location = useLocation();
  const context = useTransactionContext();
  const { data: btcFeeRate, isLoading: feeRatesLoading } = useBtcFeeRate();

  const [transaction, setTransaction] = useState<btcTransaction.EnhancedTransaction | undefined>();
  const [summary, setSummary] = useState<TransactionSummary | undefined>();
  const [error, setError] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrdinal, setSelectedOrdinal] = useState<BtcOrdinal | null>(null);

  const isRestoreFundFlow = location.state?.isRestoreFundFlow;

  useEffect(() => {
    if (!feeRate && btcFeeRate && !feeRatesLoading) {
      setFeeRate(btcFeeRate.regular.toString());
    }
  }, [feeRate, btcFeeRate, feeRatesLoading]);

  const handleOnCancelClick = () => {
    if (isRestoreFundFlow) {
      navigate('/send-btc');
    } else {
      navigate(-1);
    }
  };

  const onClickTransfer = async (ordinal: BtcOrdinal, desiredFeeRate: string) => {
    setSelectedOrdinal(ordinal);
    setFeeRate(desiredFeeRate);
    try {
      setIsLoading(true);
      setError('');
      const txSummary = await btcTransaction.sendOrdinals(
        context,
        [{ toAddress: ordinalsAddress, inscriptionId: ordinal.id }],
        Number(desiredFeeRate),
      );
      setTransaction(txSummary);
      setSummary(await txSummary.getSummary());
    } catch (err) {
      setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      setSelectedOrdinal(null);
      setTransaction(undefined);
      setSummary(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const transactionDetail = await btcTransaction.sendOrdinals(
      context,
      [{ toAddress: ordinalsAddress, inscriptionId: selectedOrdinal?.id! }],
      desiredFeeRate,
    );
    if (!transactionDetail) return;
    const txSummary = await transactionDetail.getSummary();
    if (txSummary) return Number(txSummary.fee);
    return undefined;
  };

  const handleBack = () => {
    setSelectedOrdinal(null);
    setFeeRate('');
    setTransaction(undefined);
    setSummary(undefined);
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
        selectedAccount,
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
    } catch (e) {
      console.error(e);
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: `${e}`,
          browserTx: false,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ordinalsQuery.isLoading || feeRatesLoading) {
    return (
      <>
        <TopRow title={t('RESTORE_ORDINAL_SCREEN.TITLE')} onClick={handleOnCancelClick} />
        <Container>
          <LoaderContainer>
            <Spinner color="white" size={25} />
          </LoaderContainer>
        </Container>
      </>
    );
  }

  if (summary) {
    return (
      <ConfirmBtcTransaction
        summary={summary}
        isLoading={false}
        confirmText={t('COMMON.CONFIRM')}
        cancelText={t('COMMON.CANCEL')}
        onBackClick={handleBack}
        onCancel={handleOnCancelClick}
        onConfirm={handleSubmit}
        getFeeForFeeRate={calculateFeeForFeeRate}
        onFeeRateSet={(newFeeRate) => onClickTransfer(selectedOrdinal!, newFeeRate.toString())}
        feeRate={+feeRate}
        isSubmitting={isSubmitting}
        hideBottomBar
        isBroadcast
      />
    );
  }

  return (
    <>
      <TopRow title={t('RESTORE_ORDINAL_SCREEN.TITLE')} onClick={handleOnCancelClick} />
      <Container>
        {ordinalsQuery.ordinals?.length === 0 ? (
          <>
            <RestoreFundTitle>{t('RESTORE_ORDINAL_SCREEN.NO_FUNDS')}</RestoreFundTitle>
            <ButtonContainer>
              <ActionButton text={t('RESTORE_ORDINAL_SCREEN.BACK')} onPress={handleOnCancelClick} />
            </ButtonContainer>
          </>
        ) : (
          <>
            <RestoreFundTitle>{t('RESTORE_ORDINAL_SCREEN.DESCRIPTION')}</RestoreFundTitle>
            {ordinalsQuery.ordinals?.map((ordinal) => (
              <OrdinalRow
                isLoading={selectedOrdinal === ordinal}
                disableTransfer={isLoading}
                feeRate={btcFeeRate!.regular.toString()}
                handleOrdinalTransfer={onClickTransfer}
                ordinal={ordinal}
                key={ordinal.id}
              />
            ))}
            {error && (
              <ErrorContainer>
                <ErrorText>{error}</ErrorText>
              </ErrorContainer>
            )}
          </>
        )}
      </Container>
      <BottomTabBar tab="settings" />
    </>
  );
}

export default RestoreOrdinals;
