import styled from 'styled-components';
import { Ring } from 'react-spinners-css';
import useWalletSelector from '@hooks/useWalletSelector';
import BottomTabBar from '@components/tabBar';
import Seperator from '@components/seperator';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SquaresFour from '@assets/img/nftDashboard/squares_four.svg';
import ArrowDownLeft from '@assets/img/dashboard/arrow_down_left.svg';
import ShareNetwork from '@assets/img/nftDashboard/share_network.svg';
import ActionButton from '@components/button';
import { getNfts } from '@secretkeylabs/xverse-core/api';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import BarLoader from '@components/barLoader';
import { GAMMA_URL, LoaderSize } from '@utils/constants';
import ShareDialog from '@components/shareNft';
import AccountHeaderComponent from '@components/accountHeader';
import Nft from './nft';

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
  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
  gridTemplateRows: props.isGalleryOpen ? 'minmax(150px,300px)' : 'minmax(150px,220px)',
}));

const ShareDialogeContainer = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
});

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
  marginBottom: props.theme.spacing(20),
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
}));

const WebGalleryButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  color: props.theme.colors.white['200'],
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

const NoCollectiblesText = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  color: props.theme.colors.white['200'],
  marginTop: props.theme.spacing(4),
  textAlign: 'center',
}));

const BarLoaderContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(5),
  maxWidth: 300,
}));

function NftDashboard() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const navigate = useNavigate();
  const offset = useRef(0);
  const { stxAddress, network } = useWalletSelector();
  const [showShareNftOptions, setShowNftOptions] = useState<boolean>(false);
  const {
    isLoading, data,
  } = useQuery(
    ['nft-meta-data', { stxAddress, network, offset: offset.current }],
    async () => getNfts('SP2VC4CXTWYRZEV7MSGXPNHE739N14ECQWX8JP2BF', network, offset.current),
  );

  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('options.html#/nft-dashboard'),
    });
  };

  const nftListView = (
    data?.total === 0 ? (
      <NoCollectiblesText>
        {t('NO_COLLECTIBLES')}
      </NoCollectiblesText>
    ) : (
      <GridContainer isGalleryOpen={isGalleryOpen}>
        { data?.nftsList?.map((nft) => (
          <Nft asset={nft} />
        ))}
      </GridContainer>
    )
  );

  const onSharePress = () => {
    setShowNftOptions(true);
  };

  const onCrossPress = () => {
    setShowNftOptions(false);
  };

  const onReceivePress = () => {
    navigate('/receive/STX');
  };

  return (
    <>
      <AccountHeaderComponent isNftGalleryOpen={isGalleryOpen} />
      <Seperator />
      <Container>
        <CollectibleContainer>
          {isGalleryOpen ? <GalleryCollectiblesHeadingText>{t('COLLECTIBLES')}</GalleryCollectiblesHeadingText> : <CollectiblesHeadingText>{t('COLLECTIBLES')}</CollectiblesHeadingText>}
          {isLoading ? (
            <BarLoaderContainer>
              <BarLoader loaderSize={LoaderSize.LARGE} />
            </BarLoaderContainer>
          )
            : <CollectiblesValueText>{`${data?.total} ${t('ITEMS')}`}</CollectiblesValueText>}
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
            <ActionButton src={ArrowDownLeft} text={t('RECEIVE')} onPress={onReceivePress} />
          </ReceiveButtonContainer>
          <ShareButtonContainer>
            <ActionButton
              src={ShareNetwork}
              text={t('SHARE')}
              onPress={onSharePress}
              transparent
            />
          </ShareButtonContainer>
          <ShareDialogeContainer>
            {showShareNftOptions && <ShareDialog url={`${GAMMA_URL}${stxAddress}`} onCrossClick={onCrossPress} />}
          </ShareDialogeContainer>
        </ButtonContainer>
        {isLoading ? (
          <LoaderContainer>
            <Ring color="white" size={30} />
          </LoaderContainer>
        ) : nftListView}
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
