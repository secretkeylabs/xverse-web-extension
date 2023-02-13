import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import NftImage from '@screens/nftDashboard/nftImage';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import TopRow from '@components/topRow';
import BottomTabBar from '@components/tabBar';
import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
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
import { MoonLoader } from 'react-spinners';
import AccountHeaderComponent from '@components/accountHeader';
import AlertMessage from '@components/AlertMessage';
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
  }
`;

interface ButtonProps {
  isOrdinal?: boolean;
}
const SendButtonContainer = styled.div<ButtonProps>((props) => ({
  marginRight: props.theme.spacing(3),
  width: props.isOrdinal ? 182 : '100%',
}));

const BackButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(40),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  position: 'relative',
  flexDirection: 'row',
  maxWidth: 400,
  marginBottom: props.theme.spacing(20),
}));

const ShareDialogeContainer = styled.div({
  position: 'absolute',
  bottom: 0,
  right: 0,
});

const GalleryShareDialogeContainer = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 2000,
});

const ExtensionContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 32,
  alignItems: 'center',
  flex: 1,
});

const NFtContainer = styled.div((props) => ({
  maxWidth: 450,
  width: '60%',
  display: 'flex',
  aspectRatio: 1,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  borderRadius: 8,
  marginBottom: props.theme.spacing(12),
}));

const ExtensionNFtContainer = styled.div((props) => ({
  maxHeight: 148,
  width: 148,
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
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
  ...props.theme.headline_l,
  color: props.theme.colors.white['0'],
  fontSize: 24,
  marginBottom: props.theme.spacing(16),
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
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(3),
  flexDirection: 'row',
}));

const GridContainer = styled.div((props) => ({
  display: 'grid',
  marginTop: props.theme.spacing(6),
  columnGap: props.theme.spacing(8),
  rowGap: props.theme.spacing(6),
  gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
  paddingBottom: props.theme.spacing(16),
  marginBottom: props.theme.spacing(12),
  borderBottom: `1px solid ${props.theme.colors.background.elevation2}`,
}));

const ShareButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(3),
  width: '100%',
}));

const DescriptionContainer = styled.h1((props) => ({
  display: 'flex',
  marginLeft: props.theme.spacing(20),
  flexDirection: 'column',
  marginBottom: props.theme.spacing(30),
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
  justifyContent: 'center',
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

const AssetDeatilButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 400,
  fontSize: 14,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
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

const ButtonIcon = styled.img({
  width: 12,
  height: 12,
});

const OrdinalsTag = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 2,
  background: 'rgba(39, 42, 68, 0.6)',
  borderRadius: 40,
  height: 22,
  padding: '3px 6px',
});

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textTransform: 'uppercase',
  color: props.theme.colors.white[0],
  fontSize: 10,
  marginLeft: props.theme.spacing(2),
}));

function NftDetailScreen() {
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DETAIL_SCREEN' });
  const navigate = useNavigate();
  const { stxAddress, ordinalsAddress } = useWalletSelector();
  const { id } = useParams();
  const nftIdDetails = id!.split('::');
  const { nftData } = useNftDataSelector();
  const { storeNftData } = useNftDataReducer();
  const [nft, setNft] = useState<NftData | undefined>(undefined);
  const {
    isLoading,
    data: nftDetailsData,
    mutate,
  } = useMutation<NftDetailResponse | undefined, Error, { principal: string }>(
    async ({ principal }) => {
      const contractInfo: string[] = principal.split('.');
      return getNftDetail(nftIdDetails[2].replace('u', ''), contractInfo[0], contractInfo[1]);
    },
  );

  const [showShareNftOptions, setShowNftOptions] = useState<boolean>(false);
  const [showSendOridnalsAlert, setshowSendOridnalsAlert] = useState<boolean>(false);
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  // check for ordianls
  const isOrdinal = true;
  useEffect(() => {
    const data = nftData.find(
      (nftItem) => Number(nftItem?.token_id) === Number(nftIdDetails[2].slice(1)),
    );
    if (!data) {
      mutate({ principal: nftIdDetails[0] });
    } else {
      setNft(data);
    }
  }, []);

  useEffect(() => {
    if (nftDetailsData) {
      storeNftData(nftDetailsData.data);
      setNft(nftDetailsData?.data);
    }
  }, [nftDetailsData]);

  const handleBackButtonClick = () => {
    navigate('/nft-dashboard');
  };

  const onSharePress = () => {
    setShowNftOptions(true);
  };

  const onCloseAlert = () => {
    setshowSendOridnalsAlert(false);
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

  const handleOnSendClick = () => {
    navigate('send-nft', {
      state: {
        nft,
      },
    });
  };

  const showAlert = () => {
    setshowSendOridnalsAlert(true);
  };

  const ownedByView = (
    <RowContainer>
      <NftOwnedByText>{t('OWNED_BY')}</NftOwnedByText>
      <OwnerAddressText>
        {isOrdinal
          ? `${ordinalsAddress.substring(0, 4)}...${ordinalsAddress.substring(
            ordinalsAddress.length - 4,
            ordinalsAddress.length,
          )}`
          : `${stxAddress.substring(0, 4)}...${stxAddress.substring(
            stxAddress.length - 4,
            stxAddress.length,
          )}`}
      </OwnerAddressText>
      {isOrdinal && (
        <OrdinalsTag>
          <ButtonIcon src={OrdinalsIcon} />
          <Text>{t('ORDINALS')}</Text>
        </OrdinalsTag>
      )}
    </RowContainer>
  );

  const extensionView = (
    <>
      <ExtensionContainer>
        <ExtensionNFtContainer>
          <NftImage metadata={nft?.token_metadata!} />
        </ExtensionNFtContainer>
        <NftTitleText>{nft?.token_metadata.name}</NftTitleText>
        {ownedByView}
        <WebGalleryButton onClick={openInGalleryView}>
          <>
            <ButtonImage src={SquaresFour} />
            <WebGalleryButtonText>{t('WEB_GALLERY')}</WebGalleryButtonText>
          </>
        </WebGalleryButton>
      </ExtensionContainer>
      <ButtonContainer>
        <SendButtonContainer>
          <ActionButton
            src={ArrowUpRight}
            text={t('SEND')}
            onPress={isOrdinal ? showAlert : handleOnSendClick}
          />
        </SendButtonContainer>
        {!isOrdinal && (
          <>
            <ShareButtonContainer>
              <ActionButton
                src={ShareNetwork}
                text={t('SHARE')}
                onPress={onSharePress}
                transparent
              />
            </ShareButtonContainer>
            <ShareDialogeContainer>
              {showShareNftOptions && (
                <ShareDialog
                  url={`${GAMMA_URL}collections/${nft?.token_metadata.contract_id}`}
                  onCrossClick={onCrossPress}
                />
              )}
            </ShareDialogeContainer>
          </>
        )}
      </ButtonContainer>
    </>
  );

  const galleryView = isLoading || !nft ? (
    <LoaderContainer>
      <MoonLoader color="white" size={30} />
    </LoaderContainer>
  ) : (
    <Container>
      <BackButtonContainer>
        <Button onClick={handleBackButtonClick}>
          <>
            <ButtonImage src={ArrowLeft} />
            <AssetDeatilButtonText>{t('MOVE_TO_ASSET_DETAIL')}</AssetDeatilButtonText>
          </>
        </Button>
      </BackButtonContainer>
      <NftGalleryTitleText>{nft?.token_metadata.name}</NftGalleryTitleText>
      <ButtonContainer>
        <SendButtonContainer isOrdinal={isOrdinal}>
          <ActionButton
            src={ArrowUpRight}
            text={t('SEND')}
            onPress={isOrdinal ? showAlert : handleOnSendClick}
          />
        </SendButtonContainer>

        {!isOrdinal && (
        <ShareButtonContainer>
          <ActionButton
            src={ShareNetwork}
            text={t('SHARE')}
            onPress={onSharePress}
            transparent
          />
        </ShareButtonContainer>
        )}
        <GalleryShareDialogeContainer>
          {showShareNftOptions && (
          <ShareDialog
            url={`${GAMMA_URL}collections/${nft?.token_metadata.contract_id}`}
            onCrossClick={onCrossPress}
          />
          )}
        </GalleryShareDialogeContainer>
      </ButtonContainer>
      <RowContainer>
        <NFtContainer>
          <NftImage metadata={nft?.token_metadata!} />
          {isOrdinal && ownedByView}
        </NFtContainer>
        <DescriptionContainer>
          <DescriptionText>{t('DESCRIPTION')}</DescriptionText>
          <DescriptionTile title={t('NAME')} value={nft?.token_metadata.name ?? ''} />
          {nft?.rarity_score && <DescriptionTile title={t('RARITY')} value={nft?.rarity_score} />}
          <DescriptionTile
            title={t('CONTRACT_ID')}
            value={nft?.token_metadata?.contract_id ?? ''}
          />
          {nft?.nft_token_attributes.length !== 0 && (
          <>
            <AttributeText>{t('ATTRIBUTES')}</AttributeText>
            <GridContainer>
              {nft?.nft_token_attributes.map((attribute) => (
                <NftAttribute type={attribute.trait_type} value={attribute.value} />
              ))}
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
  );

  return (
    <>
      {isGalleryOpen ? (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      ) : (
        <TopRow title={t('NFT_DETAIL')} onClick={handleBackButtonClick} />
      )}
      <Container>
        {showSendOridnalsAlert && (
          <AlertMessage
            title={t('ORDINAL_SEND_TITLE')}
            onClose={onCloseAlert}
            description={t('ORDINAL_SEND_DESCRIPTION')}
          />
        )}
        {isGalleryOpen ? galleryView : extensionView}
      </Container>
      {!isGalleryOpen && (
        <BottomBarContainer>
          <BottomTabBar tab="nft" />
        </BottomBarContainer>
      )}
    </>
  );
}

export default NftDetailScreen;
