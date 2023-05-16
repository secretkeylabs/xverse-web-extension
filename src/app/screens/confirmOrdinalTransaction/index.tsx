import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import BottomBar from '@components/tabBar';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import AccountHeaderComponent from '@components/accountHeader';
import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core/types';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import BigNumber from 'bignumber.js';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useBtcClient from '@hooks/useBtcClient';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  height: 600px;
  width: 360px;
  margin: auto;
`;

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

const BottomBarContainer = styled.h1((props) => ({
  marginTop: props.theme.spacing(3),
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const NFtContainer = styled.div((props) => ({
  maxWidth: 150,
  maxHeight: 150,
  width: '60%',
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  padding: props.theme.spacing(5),
  marginBottom: props.theme.spacing(6),
}));

function ConfirmOrdinalTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const navigate = useNavigate();
  const btcClient = useBtcClient();
  const [recipientAddress, setRecipientAddress] = useState('');
  const location = useLocation();
  const { fee, signedTxHex, ordinalUtxo } = location.state;

  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>(
    async ({ signedTx }) => btcClient.sendRawTransaction(signedTx),
  );
  const { selectedOrdinal } = useNftDataSelector();
  const { refetch } = useBtcWalletData();

  useEffect(() => {
    setRecipientAddress(location.state.recipientAddress);
  }, [location]);

  useEffect(() => {
    if (btcTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: btcTxBroadcastData.tx.hash,
          currency: 'BTC',
          error: '',
          isOrdinal: true,
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [btcTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: txError.toString(),
          isOrdinal: true,
        },
      });
    }
  }, [txError]);

  const handleOnConfirmClick = (txHex: string) => {
    mutate({ signedTx: txHex });
  };

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  return (
    <>
      {isGalleryOpen && (
        <>
          <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
          <ButtonContainer>
            <Button onClick={handleOnCancelClick}>
              <>
                <ButtonImage src={ArrowLeft} />
                <ButtonText>{t('MOVE_TO_ASSET_DETAIL')}</ButtonText>
              </>
            </Button>
          </ButtonContainer>
        </>
      )}
      <ScrollContainer>
        <ConfirmBtcTransactionComponent
          fee={fee}
          recipients={[{ address: recipientAddress, amountSats: new BigNumber(0) }]}
          loadingBroadcastedTx={isLoading}
          signedTxHex={signedTxHex}
          onConfirmClick={handleOnConfirmClick}
          onCancelClick={handleOnCancelClick}
          onBackButtonClick={handleOnCancelClick}
          ordinalTxUtxo={ordinalUtxo}
          assetDetail={selectedOrdinal?.number.toString()}
        >
          <Container>
            <NFtContainer>
              <OrdinalImage inNftSend ordinal={selectedOrdinal!} />
            </NFtContainer>
          </Container>
        </ConfirmBtcTransactionComponent>

        {!isGalleryOpen && (
          <BottomBarContainer>
            <BottomBar tab="nft" />
          </BottomBarContainer>
        )}
      </ScrollContainer>
    </>
  );
}
export default ConfirmOrdinalTransaction;
