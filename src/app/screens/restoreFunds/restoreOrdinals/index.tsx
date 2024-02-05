import ActionButton from '@components/button';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useBtcClient from '@hooks/useBtcClient';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  BtcOrdinal,
  ErrorCodes,
  getBtcFiatEquivalent,
  SignedBtcTx,
  signOrdinalSendTransaction,
} from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';
import OrdinalRow from './ordinalRow';

const RestoreFundTitle = styled.h1((props) => ({
  ...props.theme.body_l,
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
  const { network, ordinalsAddress, btcAddress, selectedAccount, btcFiatRate } =
    useWalletSelector();
  const { getSeed } = useSeedVault();
  const navigate = useNavigate();
  const { ordinals } = useOrdinalsByAddress(btcAddress);
  const [error, setError] = useState('');
  const [transferringOrdinalId, setTransferringOrdinalId] = useState<string | null>(null);
  const location = useLocation();
  const btcClient = useBtcClient();

  const isRestoreFundFlow = location.state?.isRestoreFundFlow;

  const ordinalsUtxos = useMemo(() => ordinals?.map((ord) => ord.utxo), [ordinals]);

  const {
    isLoading,
    error: transactionError,
    mutateAsync,
  } = useMutation<SignedBtcTx, string, { ordinal: BtcOrdinal; seedPhrase: string }>({
    mutationFn: async ({ ordinal, seedPhrase }) => {
      const tx = await signOrdinalSendTransaction(
        ordinalsAddress,
        ordinal.utxo,
        btcAddress,
        Number(selectedAccount?.id),
        seedPhrase,
        btcClient,
        network.type,
        ordinalsUtxos!,
      );
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

  const onClickTransfer = async (selectedOrdinal: BtcOrdinal) => {
    setTransferringOrdinalId(selectedOrdinal.id);
    const seedPhrase = await getSeed();
    const signedTx = await mutateAsync({ ordinal: selectedOrdinal, seedPhrase });
    navigate(`/nft-dashboard/confirm-ordinal-tx/${selectedOrdinal.id}`, {
      state: {
        signedTxHex: signedTx.signedTx,
        recipientAddress: ordinalsAddress,
        fee: signedTx.fee,
        feePerVByte: signedTx.feePerVByte,
        fiatFee: getBtcFiatEquivalent(signedTx.fee, BigNumber(btcFiatRate)),
        total: signedTx.total,
        fiatTotal: getBtcFiatEquivalent(signedTx.total, BigNumber(btcFiatRate)),
        ordinalUtxo: selectedOrdinal.utxo,
      },
    });
  };

  const showContent =
    ordinals?.length === 0 ? (
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
    );

  return (
    <>
      <TopRow title={t('RESTORE_ORDINAL_SCREEN.TITLE')} onClick={handleOnCancelClick} />
      <Container>
        {!ordinals ? (
          <LoaderContainer>
            <MoonLoader color="white" size={25} />
          </LoaderContainer>
        ) : (
          showContent
        )}
      </Container>
      <BottomTabBar tab="nft" />
    </>
  );
}

export default RestoreOrdinals;
