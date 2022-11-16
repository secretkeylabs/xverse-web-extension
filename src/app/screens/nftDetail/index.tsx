import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import NftImage from '@screens/nftDashboard/nftImage';
import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import TopRow from '@components/topRow';
import BottomTabBar from '@components/tabBar';
import SquaresFour from '@assets/img/nftDashboard/squares_four.svg';
import ArrowUpRight from '@assets/img/dashboard/arrow_up_right.svg';
import ShareNetwork from '@assets/img/nftDashboard/share_network.svg';
import ActionButton from '@components/button';
import useWalletSelector from '@hooks/useWalletSelector';
import { useEffect, useState } from 'react';
import ShareDialog from '@components/shareNft';
import { GAMMA_URL } from '@utils/constants';
import { getExplorerUrl } from '@utils/helper';
import useNftDataSelector from '@hooks/useNftDataSelector';
import useNftDataReducer from '@hooks/useNftReducer';
import { useMutation } from '@tanstack/react-query';
import { getNftDetail } from '@secretkeylabs/xverse-core/api';
import { NftData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { NftDetailResponse } from '@secretkeylabs/xverse-core/types';
import { Ring } from 'react-spinners-css';
import NftAttribute from './nftAttribute';
import DescriptionTile from './descriptionTile';

const Container = styled.div`
display: flex;
flex-direction: column;
flex: 1;
overflow-y: auto;
margin-left: 5%;
margin-right: 5%;
&::-webkit-scrollbar {
  display: none;
}`;

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  maxWidth: 400,
  marginTop: props.theme.spacing(6),
  marginBottom: props.theme.spacing(12),
}));

const ExtensionContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const NFtContainer = styled.div((props) => ({
  maxWidth: 450,
  width: '60%',
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  padding: props.theme.spacing(5),
  marginTop: props.theme.spacing(15),
  marginBottom: props.theme.spacing(12),
}));

const NftTitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const NftGalleryTitleText = styled.h1((props) => ({
  ...props.theme.headline_l,
  color: props.theme.colors.white['0'],
  marginBottom: props.theme.spacing(12),
}));

const DescriptionText = styled.h1((props) => ({
  ...props.theme.headline_m,
  color: props.theme.colors.white['0'],
  marginBottom: props.theme.spacing(12),
}));

const NftOwnedByText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  textAlign: 'center',
}));

const OwnerAddressText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  textAlign: 'center',
  marginLeft: props.theme.spacing(3),
}));

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const RowContainer = styled.h1((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(3),
  flexDirection: 'row',
}));

const GridContainer = styled.div((props) => ({
  display: 'grid',
  marginTop: props.theme.spacing(6),
  columnGap: props.theme.spacing(8),
  rowGap: props.theme.spacing(6),
  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
  paddingBottom: props.theme.spacing(20),
  marginBottom: props.theme.spacing(12),
  borderBottom: `1px solid ${props.theme.colors.white['400']}`,
}));

const ShareButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  width: '100%',
}));

const DescriptionContainer = styled.h1((props) => ({
  display: 'flex',
  marginLeft: props.theme.spacing(20),
  marginTop: props.theme.spacing(15),
  flexDirection: 'column',
}));

const AttributeText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  marginBottom: props.theme.spacing(2),
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
}));

const WebGalleryButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(5),
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

const WebGalleryButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(4),
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: 'transparent',
  marginBottom: props.theme.spacing(12),
}));

const ButtonText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
}));

const ButtonHiglightedText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
}));

const LoaderContainer = styled.div({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

function NftDetailScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });
  const navigate = useNavigate();
  const { stxAddress } = useWalletSelector();
  const { id } = useParams();
  const nftIdDetails = id!.split('::');
  const { nftData } = useNftDataSelector();
  const { storeNftData } = useNftDataReducer();
  const [nft, setNft] = useState<NftData | undefined>(undefined);

  const {
    isLoading,
    data: nftDetailsData,
    mutate,
  } = useMutation<
  NftDetailResponse | undefined,
  Error,
  { principal: string }>(async ({ principal }) => {
    const contractInfo: string[] = principal.split('.');
    return getNftDetail(
      nftIdDetails[2].replace('u', ''),
      contractInfo[0],
      contractInfo[1],
    );
  });

  const [showShareNftOptions, setShowNftOptions] = useState<boolean>(false);
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;

  useEffect(() => {
    const data = nftData.find((nftItem) => nftItem?.asset_id === nftIdDetails[1]);
    if (!data) {
      mutate({ principal: nftIdDetails[0] });
    } else {
      setNft(data);
    }
  }, []);

  useEffect(() => {
    if (nftDetailsData) {
      storeNftData(nftDetailsData);
      setNft(nftDetailsData?.data);
    }
  }, [nftDetailsData]);

  const handleBackButtonClick = () => {
    navigate('/nft-dashboard');
  };

  const onSharePress = () => {
    setShowNftOptions(true);
  };

  const onCrossPress = () => {
    setShowNftOptions(false);
  };

  const onGammaPress = () => {
    window.open(`${GAMMA_URL}collections/${nft?.token_metadata?.contract_id}`);
  };

  const onExplorerPress = () => {
    const address = nft?.token_metadata?.contract_id?.split('.')!;
    window.open(getExplorerUrl(address[0]));
  };

  const openInGalleryView = async () => {
    await chrome.tabs.create({
      url: chrome.runtime.getURL(`options.html#/nft-dashboard/nft-detail/${id}`),
    });
  };

  const nftImage = (
    <NFtContainer>
      <NftImage
        metadata={nft?.token_metadata!}
      />
    </NFtContainer>
  );

  const ownedByView = (
    <RowContainer>
      <NftOwnedByText>{t('OWNED_BY')}</NftOwnedByText>
      <OwnerAddressText>
        {`${stxAddress.substring(0, 4)}...${stxAddress.substring(
          stxAddress.length - 4,
          stxAddress.length,
        )}`}
      </OwnerAddressText>
    </RowContainer>
  );

  const buttons = (
    <ButtonContainer>
      <ActionButton src={ArrowUpRight} text={t('SEND')} onPress={handleBackButtonClick} />
      <ShareButtonContainer>
        <ActionButton
          src={ShareNetwork}
          text={t('SHARE')}
          onPress={onSharePress}
          transparent
        />
      </ShareButtonContainer>
      {showShareNftOptions && <ShareDialog url={`${GAMMA_URL}collections/${nft?.token_metadata.contract_id}`} onCrossClick={onCrossPress} />}
    </ButtonContainer>
  );

  const extensionView = (
    <>
      <ExtensionContainer>
        {nftImage}
        <NftTitleText>{nft?.token_metadata.name}</NftTitleText>
        {ownedByView}

        <WebGalleryButtonContainer>
          <WebGalleryButton onClick={openInGalleryView}>
            <>
              <ButtonImage src={SquaresFour} />
              <WebGalleryButtonText>{t('WEB_GALLERY')}</WebGalleryButtonText>
            </>
          </WebGalleryButton>
        </WebGalleryButtonContainer>
      </ExtensionContainer>
      {buttons}
    </>
  );

  const galleryView = (
    isLoading || !nft ? (
      <LoaderContainer>
        <Ring color="white" size={30} />
      </LoaderContainer>
    ) : (
      <Container>
        <NftGalleryTitleText>{nft?.token_metadata.name}</NftGalleryTitleText>
        {buttons}
        <RowContainer>
          {nftImage}
          <DescriptionContainer>
            <DescriptionText>
              {t('DESCRIPTION')}
            </DescriptionText>
            <DescriptionTile title={t('NAME')} value={nft?.token_metadata.name ?? ''} />
            {nft?.rarity_score && <DescriptionTile title={t('RARITY')} value={nft?.rarity_score} />}
            <DescriptionTile title={t('CONTRACT_ID')} value={nft?.token_metadata?.contract_id ?? ''} />
            {nft?.nft_token_attributes.length !== 0 && (
            <>
              <AttributeText>{t('ATTRIBUTES')}</AttributeText>
              <GridContainer>
                {nft?.nft_token_attributes.map((attribute) => (<NftAttribute type={attribute.trait_type} value={attribute.value} />))}
              </GridContainer>
            </>
            )}
            <Button onClick={onExplorerPress}>
              <ButtonText>{t('VIEW_CONTRACT')}</ButtonText>
              <ButtonHiglightedText>{t('STACKS_EXPLORER')}</ButtonHiglightedText>
              <img src={ArrowSquareOut} alt="arrow out" />
            </Button>
            <Button onClick={onGammaPress}>
              <ButtonText>{t('DETAILS')}</ButtonText>
              <ButtonHiglightedText>{t('GAMMA')}</ButtonHiglightedText>
              <img src={ArrowSquareOut} alt="arrow out" />
            </Button>
          </DescriptionContainer>
        </RowContainer>
      </Container>
    )

  );

  return (
    <>
      <TopRow title={t('NFT_DETAIL')} onClick={handleBackButtonClick} />
      <Container>
        {isGalleryOpen ? galleryView : extensionView}
      </Container>

      <BottomBarContainer>
        <BottomTabBar tab="nft" />
      </BottomBarContainer>
    </>

  );
}

export default NftDetailScreen;
