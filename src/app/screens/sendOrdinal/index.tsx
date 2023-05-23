import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ErrorCodes, ResponseError, UTXO } from '@secretkeylabs/xverse-core/types';
import { validateBtcAddress } from '@secretkeylabs/xverse-core/wallet';
import {
  SignedBtcTx,
  signOrdinalSendTransaction,
  getBtcFeesForOrdinalSend,
} from '@secretkeylabs/xverse-core/transactions/btc';
import useWalletSelector from '@hooks/useWalletSelector';
import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import AccountHeaderComponent from '@components/accountHeader';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core/currency';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useBtcClient from '@hooks/useBtcClient';
import useTextOrdinalContent from '@hooks/useTextOrdinalContent';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  width: 360px;
  margin: auto;
`;

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const NFtContainer = styled.div((props) => ({
  maxHeight: 148,
  width: 148,
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginTop: props.theme.spacing(16),
  marginBottom: props.theme.spacing(12),
}));

const OrdinalInscriptionNumber = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: '15%',
  marginTop: props.theme.spacing(40),
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  opacity: 0.8,
  marginTop: props.theme.spacing(5),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 400,
  fontSize: 14,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

function SendOrdinal() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedOrdinal } = useNftDataSelector();
  const btcClient = useBtcClient();
  const location = useLocation();
  const {
    network, ordinalsAddress, btcAddress, selectedAccount, seedPhrase, btcFiatRate,
  } = useWalletSelector();
  const [ordinalUtxo, setOrdinalUtxo] = useState<UTXO | undefined>(undefined);
  const [error, setError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const textContent = useTextOrdinalContent(selectedOrdinal!);
  const address: string | undefined = useMemo(() => (location.state ? location.state.recipientAddress : undefined), [location.state]);
  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<SignedBtcTx, ResponseError, string>(async (recepient) => {
    const addressUtxos = await btcClient.getUnspentUtxos(ordinalsAddress);
    const ordUtxo = addressUtxos.find((utx) => utx.txid === selectedOrdinal?.tx_id);
    setOrdinalUtxo(ordUtxo);
    if (ordUtxo) {
      const txFees = await getBtcFeesForOrdinalSend(recepient, ordUtxo, btcAddress, network.type);
      const signedTx = await signOrdinalSendTransaction(
        recepient,
        ordUtxo,
        btcAddress,
        Number(selectedAccount?.id),
        seedPhrase,
        network.type,
        txFees,
      );
      return signedTx;
    }
  });

  useEffect(() => {
    if (txError) {
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(txError.toString());
    }
  }, [txError]);

  useEffect(() => {
    if (data) {
      navigate(`/confirm-ordinal-tx/${id}`, {
        state: {
          signedTxHex: data.signedTx,
          recipientAddress,
          fee: data.fee,
          fiatFee: getBtcFiatEquivalent(data.fee, btcFiatRate),
          total: data.total,
          fiatTotal: getBtcFiatEquivalent(data.total, btcFiatRate),
          ordinalUtxo,
        },
      });
    }
  }, [data]);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  function validateFields(associatedAddress: string): boolean {
    if (!associatedAddress) {
      setError(t('ERRORS.ADDRESS_REQUIRED'));
      return false;
    }

    if (!validateBtcAddress({ btcAddress: associatedAddress, network: network.type })) {
      setError(t('ERRORS.ADDRESS_INVALID'));
      return false;
    }

    if (associatedAddress === ordinalsAddress) {
      setError(t('ERRORS.SEND_TO_SELF'));
      return false;
    }

    return true;
  }

  const onPressNext = async (associatedAddress: string) => {
    setRecipientAddress(associatedAddress);
    if (validateFields(associatedAddress)) {
      mutate(associatedAddress);
    }
  };

  return (
    <>
      {isGalleryOpen && (
        <>
          <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
          <ButtonContainer>
            <Button onClick={handleBackButtonClick}>
              <>
                <ButtonImage src={ArrowLeft} />
                <ButtonText>{t('MOVE_TO_ASSET_DETAIL')}</ButtonText>
              </>
            </Button>
          </ButtonContainer>
        </>
      )}
      <ScrollContainer>
        {!isGalleryOpen && (
          <TopRow title={t('SEND_ORDINAL_TITLE')} onClick={handleBackButtonClick} />
        )}
        <SendForm
          processing={isLoading}
          currencyType={textContent.includes('brc-20') ? 'brc20-Ordinal' : 'Ordinal'}
          disableAmountInput
          recepientError={error}
          recipient={address}
          onPressSend={onPressNext}
        >
          <Container>
            <NFtContainer>
              <OrdinalImage inNftSend ordinal={selectedOrdinal!} />
            </NFtContainer>
            <OrdinalInscriptionNumber>{`Inscription ${selectedOrdinal?.number}`}</OrdinalInscriptionNumber>
          </Container>
        </SendForm>
        <BottomBarContainer>{!isGalleryOpen && <BottomBar tab="nft" />}</BottomBarContainer>
      </ScrollContainer>
    </>
  );
}

export default SendOrdinal;
