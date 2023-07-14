import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { StacksTransaction } from '@secretkeylabs/xverse-core/types';
import { broadcastSignedTransaction } from '@secretkeylabs/xverse-core/transactions';
import { deserializeTransaction } from '@stacks/transactions';
import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import BottomBar from '@components/tabBar';
import AssetIcon from '@assets/img/transactions/Assets.svg';
import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import NftImage from '@screens/nftDashboard/nftImage';
import AccountHeaderComponent from '@components/accountHeader';
import TopRow from '@components/topRow';
import useNetworkSelector from '@hooks/useNetwork';
import RecipientComponent from '@components/recipientComponent';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import useWalletSelector from '@hooks/useWalletSelector';
import useStxWalletData from '@hooks/queries/useStxWalletData';

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

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(16),
  textAlign: 'center',
}));

function ConfirmNftTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { nftData } = useNftDataSelector();
  const nftIdDetails = id!.split('::');
  const nft = nftData.find((nftItem) => nftItem?.asset_id === nftIdDetails[1]);
  const { unsignedTx: unsignedTxHex, recipientAddress } = location.state;
  const unsignedTx = deserializeTransaction(unsignedTxHex);
  const {
    network,
  } = useWalletSelector();
  const {
    refetch,
  } = useStxWalletData();
  const selectedNetwork = useNetworkSelector();
  const {
    isLoading,
    error: txError,
    data: stxTxBroadcastData,
    mutate,
  } = useMutation<
  string,
  Error,
  { signedTx: StacksTransaction }>({ mutationFn: async ({ signedTx }) => broadcastSignedTransaction(signedTx, selectedNetwork) });

  useEffect(() => {
    if (stxTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: stxTxBroadcastData,
          currency: 'STX',
          error: '',
          isNft: true,
        },
      });
      setTimeout(() => {
        refetch();
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
          isNft: true,
        },
      });
    }
  }, [txError]);

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
        {!isGalleryOpen && <TopRow title={t('CONFIRM_TX')} onClick={handleOnCancelClick} />}
        <ConfirmStxTransationComponent
          initialStxTransactions={[unsignedTx]}
          loading={isLoading}
          onConfirmClick={handleOnConfirmClick}
          onCancelClick={handleOnCancelClick}
          isAsset
        >
          <Container>
            <NFtContainer>
              <NftImage
                metadata={nft?.token_metadata!}
              />
            </NFtContainer>
            <ReviewTransactionText>{t('REVIEW_TRANSACTION')}</ReviewTransactionText>
          </Container>
          <RecipientComponent
            address={recipientAddress}
            value={nft?.token_metadata.name!}
            icon={AssetIcon}
            currencyType="NFT"
            title={t('ASSET')}
          />
          <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
        </ConfirmStxTransationComponent>
        {!isGalleryOpen && <BottomBar tab="nft" />}
      </ScrollContainer>
    </>

  );
}
export default ConfirmNftTransaction;
