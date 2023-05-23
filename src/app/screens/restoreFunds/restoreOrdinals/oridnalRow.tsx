import useInscriptionDetails from '@hooks/queries/ordinals/useInscriptionDetails';
import useWalletSelector from '@hooks/useWalletSelector';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import {
  BtcOrdinal, ErrorCodes, getBtcFiatEquivalent,
} from '@secretkeylabs/xverse-core';
import {
  SignedBtcTx, signOrdinalSendTransaction,
} from '@secretkeylabs/xverse-core/transactions/btc';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

const OrdinalCard = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.background.elevation1,
  borderRadius: 8,
  padding: '16px 12px',
}));

const OrdinalImageContainer = styled.div((props) => ({
  width: 48,
  height: 48,
  background: props.theme.colors.background.elevation2,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white[400],
}));

const TransferButton = styled.button((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white[0],
  background: 'transparent',
  width: 86,
  border: `1px solid ${props.theme.colors.background.elevation6}`,
  borderRadius: 8,
  padding: '12px 16px',
}));

const ButtonContainer = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
});

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginLeft: 12,
});

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

interface Props {
  ordinal: BtcOrdinal;
  setError: (error: string) => void;
}

function OrdinalRow({
  ordinal, setError,
}: Props) {
  const { t } = useTranslation('translation');
  const {
    network, ordinalsAddress, btcAddress, selectedAccount, seedPhrase, btcFiatRate,
  } = useWalletSelector();
  const navigate = useNavigate();
  const ordinalData = useInscriptionDetails(ordinal.id);

  const {
    isLoading,
    data: signedTx,
    error: transactionError,
    mutate,
  } = useMutation<SignedBtcTx, string>(async () => {
    const tx = await signOrdinalSendTransaction(
      ordinalsAddress,
      ordinal.utxo,
      btcAddress,
      Number(selectedAccount?.id),
      seedPhrase,
      network.type,
    );
    return tx;
  });

  useEffect(() => {
    if (signedTx) {
      navigate(`/confirm-ordinal-tx/${ordinal.id}`, {
        state: {
          signedTxHex: signedTx.signedTx,
          recipientAddress: ordinalsAddress,
          fee: signedTx.fee,
          feePerVByte: signedTx.feePerVByte,
          fiatFee: getBtcFiatEquivalent(signedTx.fee, btcFiatRate),
          total: signedTx.total,
          fiatTotal: getBtcFiatEquivalent(signedTx.total, btcFiatRate),
          ordinalUtxo: ordinal.utxo,
        },
      });
    }
  }, [signedTx]);

  useEffect(() => {
    if (transactionError) {
      if (Number(transactionError) === ErrorCodes.InSufficientBalance) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(transactionError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('TX_ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(transactionError.toString());
    }
  }, [transactionError]);

  const onClick = () => {
    mutate();
  };

  return (
    <OrdinalCard>
      <OrdinalImageContainer>
        <OrdinalImage isSmallImage ordinal={ordinalData?.data!} />
      </OrdinalImageContainer>

      <ColumnContainer>
        <TitleText>{`Inscription ${ordinalData?.data?.number}`}</TitleText>
        <ValueText>Ordinal</ValueText>
      </ColumnContainer>
      <ButtonContainer>
        <TransferButton onClick={onClick}>
          {isLoading ? (
            <LoaderContainer>
              <MoonLoader color="white" size={15} />
            </LoaderContainer>
          ) : t('RESTORE_ORDINAL_SCREEN.TRANSFER')}
        </TransferButton>
      </ButtonContainer>
    </OrdinalCard>
  );
}

export default OrdinalRow;
