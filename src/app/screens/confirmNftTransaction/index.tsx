import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { StacksTransaction } from '@secretkeylabs/xverse-core/types';
import { broadcastSignedTransaction } from '@secretkeylabs/xverse-core/transactions';
import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import Seperator from '@components/seperator';
import { StoreState } from '@stores/index';
import BottomBar from '@components/tabBar';
import { fetchStxWalletDataRequestAction } from '@stores/wallet/actions/actionCreators';
import RecipientAddressView from '@components/recipinetAddressView';
import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import useNftDataSelector from '@hooks/useNftDataSelector';
import NftImage from '@screens/nftDashboard/nftImage';
import AccountHeaderComponent from '@components/accountHeader';
import TopRow from '@components/topRow';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  };
  height: 600px;
  width: 360px;
  margin: auto;
`;

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: '15%',
  marginTop: props.theme.spacing(20),
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

const IndicationText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
  fontSize: 14,
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const NFtContainer = styled.div((props) => ({
  maxWidth: 120,
  maxHeight: 120,
  width: '60%',
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  padding: props.theme.spacing(5),
  marginBottom: props.theme.spacing(6),
}));

const NftTitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

function ConfirmNftTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();
  const { nftData } = useNftDataSelector();
  const nftIdDetails = id!.split('::');
  const nft = nftData.find((nftItem) => nftItem?.asset_id === nftIdDetails[1]);
  const { unsignedTx, recipientAddress } = location.state;
  const {
    stxBtcRate, network, stxAddress, fiatCurrency,
  } = useSelector(
    (state: StoreState) => state.walletState,
  );

  const {
    isLoading,
    error: txError,
    data: stxTxBroadcastData,
    mutate,
  } = useMutation<
  string,
  Error,
  { signedTx: StacksTransaction }>(async ({ signedTx }) => broadcastSignedTransaction(signedTx, network.type));

  useEffect(() => {
    if (stxTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: stxTxBroadcastData,
          currency: 'STX',
          error: '',
        },
      });
      setTimeout(() => {
        dispatch(fetchStxWalletDataRequestAction(stxAddress, network, fiatCurrency, stxBtcRate));
      }, 1000);
    }
  }, [stxTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: txError.toString(),
        },
      });
    }
  }, [txError]);

  const networkInfoSection = (
    <InfoContainer>
      <TitleText>{t('NETWORK')}</TitleText>
      <ValueText>{network.type}</ValueText>
    </InfoContainer>
  );

  const handleOnConfirmClick = (txs: StacksTransaction[]) => {
    mutate({ signedTx: txs[0] });
  };

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  return (
    <>
      {isGalleryOpen && (
      <>
        <AccountHeaderComponent isNftGalleryOpen={isGalleryOpen} />
        <Seperator />
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
        {!isGalleryOpen && <TopRow title={t('CONFIRM_TX')} onClick={handleOnCancelClick} />}
        <ConfirmStxTransationComponent
          initialStxTransactions={[unsignedTx]}
          loading={isLoading}
          onConfirmClick={handleOnConfirmClick}
          onCancelClick={handleOnCancelClick}
        >
          <Container>
            <IndicationText>{t('INDICATION')}</IndicationText>
            <NFtContainer>

              <NftImage
                metadata={nft?.token_metadata!}
              />
            </NFtContainer>
            <NftTitleText>{nft?.token_metadata.name}</NftTitleText>
          </Container>
          <RecipientAddressView recipient={recipientAddress} />
          {networkInfoSection}
          <Seperator />
        </ConfirmStxTransationComponent>
        {!isGalleryOpen && <BottomBar tab="nft" />}
      </ScrollContainer>
    </>

  );
}
export default ConfirmNftTransaction;
