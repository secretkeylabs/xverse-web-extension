import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { BtcOrdinal, ErrorCodes, Inscription } from '@secretkeylabs/xverse-core/types';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core/currency';
import { SignedBtcTx, signOrdinalTransaction } from '@secretkeylabs/xverse-core/transactions/btc';
import useWalletSelector from '@hooks/useWalletSelector';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import useOrdinalDataReducer from '@hooks/stores/useOrdinalReducer';
import TopRow from '@components/topRow';
import styled from 'styled-components';
import ActionButton from '@components/button';
import BottomTabBar from '@components/tabBar';
import OrdinalRow from './ordinalRow';
import useOrdinalsApi from '@hooks/useOrdinalsApi';

const RestoreFundTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  marginBottom: 32,
  color: props.theme.colors.white[200],
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

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
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
  const { network, ordinalsAddress, btcAddress, selectedAccount, seedPhrase, btcFiatRate } =
    useWalletSelector();
  const { setSelectedOrdinalDetails } = useOrdinalDataReducer();
  const navigate = useNavigate();

  const { ordinals } = useOrdinalsByAddress(btcAddress);
  const [error, setError] = useState('');
  const [transferringOrdinalId, setTransferringOrdinalId] = useState<string | null>(null);
  const location = useLocation();
  const isRestoreFundFlow = location.state?.isRestoreFundFlow;
  const ordinalsApi = useOrdinalsApi();

  const {
    isLoading,
    error: transactionError,
    mutateAsync,
  } = useMutation<SignedBtcTx, string, Inscription>({
    mutationFn: async (ordinal) => {
      const tx = await signOrdinalTransaction({
        recipientAddress: ordinalsAddress,
        ordinalsAddress,
        btcAddress,
        accountIndex: Number(selectedAccount?.id),
        seedPhrase,
        network: network.type,
        ordinal,
      });
      return tx;
    },
  });

  useEffect(() => {
    if (transactionError) {
      if (Number(transactionError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(transactionError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(transactionError.toString());
    }
  }, [transactionError]);

  const handleOnCancelClick = () => {
    if (isRestoreFundFlow) {
      navigate('/send-btc');
    } else {
      navigate(-1);
    }
  };

  const onClickTransfer = async (selectedOrdinal: BtcOrdinal, ordinalData: Inscription) => {
    if (selectedOrdinal) {
      const selectedInscription: Inscription = await ordinalsApi.getInscription(selectedOrdinal.id);
      const signedTx = await mutateAsync(selectedInscription);
      setSelectedOrdinalDetails(ordinalData);
      navigate(`/confirm-ordinal-tx/${selectedOrdinal.id}`, {
        state: {
          signedTxHex: signedTx.signedTx,
          recipientAddress: ordinalsAddress,
          fee: signedTx.fee,
          feePerVByte: signedTx.feePerVByte,
          fiatFee: getBtcFiatEquivalent(signedTx.fee, btcFiatRate),
          total: signedTx.total,
          fiatTotal: getBtcFiatEquivalent(signedTx.total, btcFiatRate),
          ordinalUtxo: selectedOrdinal.utxo,
          ordinal: selectedInscription,
        },
      });
    }
  };

  return (
    <>
      <TopRow title={t('RESTORE_ORDINAL_SCREEN.TITLE')} onClick={handleOnCancelClick} />
      <Container>
        {ordinals?.length === 0 ? (
          <>
            <RestoreFundTitle>{t('RESTORE_ORDINAL_SCREEN.NO_FUNDS')}</RestoreFundTitle>
            <ButtonContainer>
              <ActionButton text={t('RESTORE_ORDINAL_SCREEN.BACK')} onPress={handleOnCancelClick} />
            </ButtonContainer>
          </>
        ) : (
          <>
            <RestoreFundTitle>{t('RESTORE_ORDINAL_SCREEN.DESCRIPTION')}</RestoreFundTitle>
            {ordinals?.map((ordinal) => (
              <OrdinalRow
                isLoading={transferringOrdinalId === ordinal.id}
                disableTransfer={isLoading}
                handleOrdinalTransfer={onClickTransfer}
                ordinal={ordinal}
                key={ordinal.id}
              />
            ))}
            <ErrorContainer>
              <ErrorText>{error}</ErrorText>
            </ErrorContainer>
          </>
        )}
      </Container>
      <BottomTabBar tab="nft" />
    </>
  );
}

export default RestoreOrdinals;
