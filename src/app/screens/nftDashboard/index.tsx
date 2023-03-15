import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';
import useWalletSelector from '@hooks/useWalletSelector';
import BottomTabBar from '@components/tabBar';
import { useTranslation } from 'react-i18next';
import InfoIcon from '@assets/img/info.svg';
import SquaresFour from '@assets/img/nftDashboard/squares_four.svg';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ShareNetwork from '@assets/img/nftDashboard/share_network.svg';
import ActionButton from '@components/button';
import { getNfts, getNonOrdinalUtxo, getOrdinalsByAddress } from '@secretkeylabs/xverse-core/api';
import { useCallback, useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import BarLoader from '@components/barLoader';
import { GAMMA_URL, LoaderSize, REFETCH_UNSPENT_UTXO_TIME } from '@utils/constants';
import ShareDialog from '@components/shareNft';
import AccountHeaderComponent from '@components/accountHeader';
import useNetworkSelector from '@hooks/useNetwork';
import Ordinal from '@screens/ordinals';
import AlertMessage from '@components/alertMessage';
import { ChangeActivateOrdinalsAction } from '@stores/wallet/actions/actionCreators';
import { useDispatch } from 'react-redux';
import { BtcOrdinal, NftsListData } from '@secretkeylabs/xverse-core/types';
import { useNavigate } from 'react-router-dom';
import { getTimeForNonOrdinalTransferTransaction } from '@utils/localStorage';
import { UnspentOutput } from '@secretkeylabs/xverse-core/transactions/btc';
import Nft from './nft';
import ReceiveNftModal from './receiveNft';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 5%;
  margin-right: 5%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

interface GridContainerProps {
  isGalleryOpen: boolean;
}

const GridContainer = styled.div<GridContainerProps>((props) => ({
  display: 'grid',
  columnGap: props.theme.spacing(8),
  rowGap: props.theme.spacing(6),
  marginTop: props.theme.spacing(14),
  gridTemplateColumns: props.isGalleryOpen ? 'repeat(auto-fill,minmax(300px,1fr))' : 'repeat(auto-fill,minmax(150px,1fr))',
  gridTemplateRows: props.isGalleryOpen ? 'repeat(minmax(300px,1fr))' : 'minmax(150px,220px)',
}));

const ShareDialogeContainer = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 2000,
});

const ReciveNftContainer = styled.div((props) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 2000,
  background: props.theme.colors.background.elevation2,
  borderRadius: 16,
}));

const CollectibleContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(12),
}));

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxWidth: 400,
}));

const ShareButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(3),
  width: '100%',
}));

const ReceiveButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(3),
  width: '100%',
}));

const WebGalleryButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(8),
  opacity: 0.8,
  ':hover': {
    opacity: 1,
  },
}));

const WebGalleryButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const BottomBarContainer = styled.div({
  marginTop: '5%',
});

const WithdrawAlertContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  borderRadius: 12,
  alignItems: 'flex-start',
  backgroundColor: 'transparent',
  padding: props.theme.spacing(8),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  marginTop: 24,
}));

const TextContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
}));

const RedirectButton = styled.button((props) => ({
  ...props.theme.body_medium_m,
  background: 'transparent',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  marginTop: 4,
  color: props.theme.colors.white['0'],
}));

const SubText = styled.h1((props) => ({
  ...props.theme.body_xs,
  marginTop: props.theme.spacing(2),
  color: props.theme.colors.white['200'],
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['200'],
  lineHeight: 1.4,
}));

const CollectiblesHeadingText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['200'],
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  opacity: 0.7,
}));

const GalleryCollectiblesHeadingText = styled.h1((props) => ({
  ...props.theme.headline_category_m,
  color: props.theme.colors.white['200'],
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  opacity: 0.7,
}));

const CollectiblesValueText = styled.h1((props) => ({
  ...props.theme.headline_l,
  marginTop: props.theme.spacing(4),
}));

const LoadMoreButtonContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: props.theme.spacing(30),
}));

const LoadMoreButton = styled.button((props) => ({
  ...props.theme.body_medium_l,
  fontSize: 13,
  width: 98,
  height: 34,
  color: props.theme.colors.white['0'],
  border: `1px solid ${props.theme.colors.background.elevation3}`,
  background: props.theme.colors.background.elevation0,
  borderRadius: 24,
  padding: '8px, 16px, 8px, 16px',
  ':hover': {
    background: props.theme.colors.background.elevation9,
  },
  ':focus': {
    background: props.theme.colors.background.elevation10,
  },
}));

const NoCollectiblesText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(20),
  textAlign: 'center',
}));

const BarLoaderContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(5),
  maxWidth: 300,
}));

function NftDashboard() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const selectedNetwork = useNetworkSelector();
  const { network } = useWalletSelector();
  const { stxAddress, ordinalsAddress, hasActivatedOrdinalsKey } = useWalletSelector();
  const [showShareNftOptions, setShowNftOptions] = useState<boolean>(false);
  const [openReceiveModal, setOpenReceiveModal] = useState(false);
  const [showActivateOrdinalsAlert, setShowActivateOrdinalsAlert] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function fetchNfts({ pageParam = 0 }): Promise<NftsListData> {
    return getNfts(stxAddress, selectedNetwork, pageParam);
  }

  const fetchNonOrdinalUtxo = async () => {
    const lastTransactionTime = await getTimeForNonOrdinalTransferTransaction(ordinalsAddress);
    if (!lastTransactionTime) {
      return getNonOrdinalUtxo(ordinalsAddress, network.type);
    }
    const diff = new Date().getTime() - Number(lastTransactionTime);
    if (diff > REFETCH_UNSPENT_UTXO_TIME) {
      return getNonOrdinalUtxo(ordinalsAddress, network.type);
    }
    return [] as UnspentOutput[];
  };

  const fetchOrdinals = useCallback(async (): Promise<BtcOrdinal[]> => {
    let response = await getOrdinalsByAddress(ordinalsAddress);
    response = response.filter((ordinal) => ordinal.id !== undefined);
    return response;
  }, [ordinalsAddress]);

  const { data: unspentUtxos, refetch: refetchNonOrdinalUtxos } = useQuery({
    keepPreviousData: false,
    queryKey: [`getNonOrdinalsUtxo-${ordinalsAddress}`],
    queryFn: fetchNonOrdinalUtxo,
  });

  const {
    isLoading, data, fetchNextPage, isFetchingNextPage, hasNextPage, refetch,
  } = useInfiniteQuery(
    [`nft-meta-data${stxAddress}`],
    fetchNfts,
    {
      keepPreviousData: false,
      getNextPageParam: (lastpage, pages) => {
        const currentLength = pages.map(((page) => page.nftsList)).flat().length;
        if (currentLength < lastpage.total) {
          return currentLength;
        }
        return false;
      },
    },
  );

  const { data: ordinals } = useQuery({
    queryKey: [`ordinals-${ordinalsAddress}`],
    queryFn: fetchOrdinals,
  });

  const refetchCollectibles = useCallback(async () => {
    await refetch();
    await fetchOrdinals();
    refetchNonOrdinalUtxos();
  }, [refetch, fetchOrdinals]);

  useEffect(() => {
    refetchCollectibles();
  }, [stxAddress, ordinalsAddress]);

  const nfts = data?.pages.map((page) => page.nftsList).flat();
  const ordinalsLength = ordinals?.length;
  let totalNfts = data && data.pages.length > 0 ? data.pages[0].total : 0;

  if (hasActivatedOrdinalsKey && ordinalsLength) {
    totalNfts = ordinalsLength + totalNfts;
  }
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;

  useEffect(() => {
    if (hasActivatedOrdinalsKey === undefined && ordinals && ordinals?.length > 0) {
      setShowActivateOrdinalsAlert(true);
    }
  }, [hasActivatedOrdinalsKey, ordinalsLength]);

  const onLoadMoreButtonClick = () => {
    fetchNextPage();
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/nft-dashboard'),
    });
  };

  const onReceiveModalOpen = () => {
    setOpenReceiveModal(true);
  };

  const onReceiveModalClose = () => {
    setOpenReceiveModal(false);
  };

  const nftListView = (
    totalNfts === 0 && ordinalsLength === 0 ? (
      <NoCollectiblesText>
        {t('NO_COLLECTIBLES')}
      </NoCollectiblesText>
    ) : (
      <>
        <GridContainer isGalleryOpen={isGalleryOpen}>
          { hasActivatedOrdinalsKey && ordinals?.map((ordinal) => (
            <Ordinal asset={ordinal} key={ordinal.id} />
          ))}
          { nfts?.map((nft) => (
            <Nft asset={nft} key={nft.asset_identifier} />
          ))}
        </GridContainer>
        {hasNextPage && (isFetchingNextPage
          ? (
            <LoadMoreButtonContainer>
              <MoonLoader color="white" size={30} />
            </LoadMoreButtonContainer>
          )
          : (
            <LoadMoreButtonContainer>
              <LoadMoreButton onClick={onLoadMoreButtonClick}>
                {t('LOAD_MORE')}
              </LoadMoreButton>
            </LoadMoreButtonContainer>
          )
        )}
      </>

    )
  );

  const onSharePress = () => {
    setShowNftOptions(true);
  };

  const onCrossPress = () => {
    setShowNftOptions(false);
  };

  const onRestoreFundClick = () => {
    navigate('restore-funds', {
      state: {
        unspentUtxos,
      },
    });
  };

  const onActivateOrdinalsAlertCrossPress = () => {
    setShowActivateOrdinalsAlert(false);
  };

  const onActivateOrdinalsAlertDenyPress = () => {
    setShowActivateOrdinalsAlert(false);
    dispatch(ChangeActivateOrdinalsAction(false));
  };

  const onActivateOrdinalsAlertActivatePress = () => {
    setShowActivateOrdinalsAlert(false);
    dispatch(ChangeActivateOrdinalsAction(true));
  };

  return (
    <>
      {showActivateOrdinalsAlert && (
      <AlertMessage
        title={t('ACTIVATE_ORDINALS')}
        description={t('ACTIVATE_ORDINALS_INFO')}
        buttonText={t('DENY')}
        onClose={onActivateOrdinalsAlertCrossPress}
        secondButtonText={t('ACTIVATE')}
        onButtonClick={onActivateOrdinalsAlertDenyPress}
        onSecondButtonClick={onActivateOrdinalsAlertActivatePress}
      />
      )}
      <AccountHeaderComponent disableMenuOption={isGalleryOpen} />
      <Container>
        <CollectibleContainer>
          {isGalleryOpen ? (
            <GalleryCollectiblesHeadingText>{t('COLLECTIBLES')}</GalleryCollectiblesHeadingText>
          ) : (
            <CollectiblesHeadingText>{t('COLLECTIBLES')}</CollectiblesHeadingText>
          )}
          {isLoading ? (
            <BarLoaderContainer>
              <BarLoader loaderSize={LoaderSize.LARGE} />
            </BarLoaderContainer>
          ) : (
            <CollectiblesValueText>{`${totalNfts} ${t('ITEMS')}`}</CollectiblesValueText>
          )}
          {!isGalleryOpen && (
            <WebGalleryButton onClick={openInGalleryView}>
              <>
                <ButtonImage src={SquaresFour} />
                <WebGalleryButtonText>{t('WEB_GALLERY')}</WebGalleryButtonText>
              </>
            </WebGalleryButton>
          )}
        </CollectibleContainer>
        <ButtonContainer>
          <ReceiveButtonContainer>
            <ActionButton src={ArrowDownLeft} text={t('RECEIVE')} onPress={onReceiveModalOpen} />
          </ReceiveButtonContainer>
          {openReceiveModal && (
            <ReciveNftContainer>
              <ReceiveNftModal
                visible={openReceiveModal}
                isGalleryOpen={isGalleryOpen}
                onClose={onReceiveModalClose}
              />
            </ReciveNftContainer>
          )}
          {/* <ShareButtonContainer>
            <ActionButton src={ShareNetwork} text={t('SHARE')} onPress={onSharePress} transparent />
          </ShareButtonContainer> */}
          <ShareDialogeContainer>
            {showShareNftOptions && (
              <ShareDialog url={`${GAMMA_URL}${stxAddress}`} onCrossClick={onCrossPress} />
            )}
          </ShareDialogeContainer>
        </ButtonContainer>
        {!isGalleryOpen && unspentUtxos && unspentUtxos.length > 0 && (
        <WithdrawAlertContainer>
          <img src={InfoIcon} alt="alert" />
          <TextContainer>
            <SubText>{t('WITHDRAW_BTC_ALERT_TITLE')}</SubText>
            <RedirectButton onClick={onRestoreFundClick}>{t('WITHDRAW_BTC_ALERT_DESCRIPTION')}</RedirectButton>
          </TextContainer>
        </WithdrawAlertContainer>
        )}
        {isLoading ? (
          <LoaderContainer>
            <MoonLoader color="white" size={30} />
          </LoaderContainer>
        ) : (
          nftListView
        )}
      </Container>

      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
    </>
  );
}

export default NftDashboard;
