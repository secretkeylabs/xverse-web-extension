import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  BtcOrdinal, ErrorCodes, OrdinalInfo, ResponseError,
} from '@secretkeylabs/xverse-core/types';
import { validateBtcAddress } from '@secretkeylabs/xverse-core/wallet';
import { getOrdinalsByAddress } from '@secretkeylabs/xverse-core/api';
import {
  SignedBtcTx,
  signOrdinalSendTransaction,
  getBtcFeesForOrdinalSend,
} from '@secretkeylabs/xverse-core/transactions/btc';
import useNftDataSelector from '@hooks/useNftDataSelector';
import useWalletSelector from '@hooks/useWalletSelector';
import SendForm from '@components/sendForm';
import TopRow from '@components/topRow';
import BottomBar from '@components/tabBar';
import AccountHeaderComponent from '@components/accountHeader';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core';

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
  const location = useLocation();
  const {
    network, ordinalsAddress, btcAddress, selectedAccount, seedPhrase, btcFiatRate,
  } = useWalletSelector();
  const { ordinalsData } = useNftDataSelector();
  const [ordinal, setOrdinal] = useState<OrdinalInfo | undefined>(undefined);
  const [error, setError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  let address: string | undefined;

  if (location.state) {
    address = location.state.recipientAddress;
  }

  const ordinalIdDetails = id!.split('::');

  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;

  useEffect(() => {
    const data = ordinalsData.find(
      (inscription) => inscription?.metadata?.id === ordinalIdDetails[0],
    );
    if (data) {
      setOrdinal(data);
    }
  }, []);

  function fetchOrdinals(): Promise<BtcOrdinal[]> {
    return getOrdinalsByAddress(ordinalsAddress);
  }

  const { data: ordinals } = useQuery({
    queryKey: [`ordinals-${ordinalsAddress}`],
    queryFn: fetchOrdinals,
  });

  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<SignedBtcTx, ResponseError, string>(async (recepient) => {
    const ordinalUtx = ordinals?.find((inscription) => inscription.id === ordinalIdDetails[0])?.utxo;
    if (ordinalUtx) {
      const txFees = await getBtcFeesForOrdinalSend(
        recepient,
        ordinalUtx,
        btcAddress,
        network.type,
      );
      const signedTx = await signOrdinalSendTransaction(
        recepient,
        ordinalUtx,
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
          currencyType="Ordinal"
          disableAmountInput
          recepientError={error}
          recipient={address}
          onPressSend={onPressNext}
        >
          <Container>
            <NFtContainer>
              <OrdinalImage ordinal={ordinal!} />
            </NFtContainer>
            <OrdinalInscriptionNumber>{ordinal?.inscriptionNumber}</OrdinalInscriptionNumber>
          </Container>
        </SendForm>
        <BottomBarContainer>{!isGalleryOpen && <BottomBar tab="nft" />}</BottomBarContainer>
      </ScrollContainer>
    </>
  );
}

export default SendOrdinal;
