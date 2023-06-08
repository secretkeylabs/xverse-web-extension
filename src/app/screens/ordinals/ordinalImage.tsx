import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import Image from 'rc-image';
import { getFetchableUrl } from '@utils/helper';
import PlaceholderImage from '@assets/img/nftDashboard/nft_fallback.svg';
import { useTranslation } from 'react-i18next';
import { Inscription } from '@secretkeylabs/xverse-core';
import useTextOrdinalContent from '@hooks/useTextOrdinalContent';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Brc20Tile from './brc20Tile';

interface ContainerProps {
  isGalleryOpen: boolean;
  inNftDetail?: boolean;
  isSmallImage?: boolean;
}

const ImageContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: props.inNftDetail ? props.theme.spacing(8) : 0,
  alignItems: 'center',
  width: '100%',
  height: props.isGalleryOpen ? props.inNftDetail ? 540 : 300 : props.isSmallImage ? 50 : 150,
  minHeight: props.isGalleryOpen ? 300 : props.isSmallImage ? 50 : 150,
  maxHeight: props.isGalleryOpen ? props.inNftDetail ? 450 : 300 : props.isSmallImage ? 50 : 150,
  overflow: 'hidden',
  position: 'relative',
  fontSize: '3em',
  wordWrap: 'break-word',
  backgroundColor: '#1b1e2b',
  borderRadius: 8,
}));

const ButtonIcon = styled.img({
  width: 12,
  height: 12,
});

const OrdinalsTag = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(39, 42, 68, 0.6)',
  borderRadius: 40,
  width: 79,
  height: 22,
  left: 12,
  bottom: 12,
  zIndex: 1000,
  position: 'absolute',
  padding: '3px 6px',
});

const LoaderContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  width: '100%',
  height: props.isGalleryOpen ? 300 : 150,
  minHeight: props.isGalleryOpen ? 300 : 150,
  maxHeight: props.isGalleryOpen ? 300 : 150,
  left: 0,
  bottom: 0,
  right: 0,
  top: 0,
}));

const Text = styled.h1((props) => ({
  ...props.theme.body_bold_m,
  textTransform: 'uppercase',
  color: props.theme.colors.white[0],
  fontSize: 10,
  marginLeft: props.theme.spacing(4),
}));

interface TextProps {
  inNftSend?: boolean;
}

const OrdinalContentText = styled.h1<TextProps>((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
  fontSize: props.inNftSend ? 15 : 'calc(0.8vw + 2vh)',
  overflow: 'hidden',
  textAlign: 'center',
}));

const StyledLazyLoadImage = styled(LazyLoadImage)`
  border-radius: 8px;
  object-fit: contain;
  image-rendering: pixelated;
`;

interface Props {
  ordinal: Inscription;
  isNftDashboard?: boolean;
  inNftDetail?: boolean;
  inNftSend?: boolean;
  isSmallImage?: boolean;
}

function OrdinalImage({
  ordinal,
  isNftDashboard = false,
  inNftDetail = false,
  inNftSend = false,
  isSmallImage = false,
}: Props) {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const textContent = useTextOrdinalContent(ordinal);
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });

  if (ordinal?.content_type.includes('image')) {
    return (
      <ImageContainer isSmallImage={isSmallImage} isGalleryOpen={isGalleryOpen}>
        <StyledLazyLoadImage
          width="100%"
          placeholder={(
            <LoaderContainer isGalleryOpen={isGalleryOpen}>
              <MoonLoader color="white" size={20} />
            </LoaderContainer>
              )}
          src={getFetchableUrl(`https://api.hiro.so/ordinals/v1/inscriptions/${ordinal.id}/content`, 'http')}
        />
        {isNftDashboard && (
          <OrdinalsTag>
            <ButtonIcon src={OrdinalsIcon} />
            <Text>{t('ORDINAL')}</Text>
          </OrdinalsTag>
        )}
      </ImageContainer>
    );
  }
  if (ordinal?.content_type.includes('text')) {
    if (!textContent) {
      return (
        <ImageContainer isSmallImage={isSmallImage} isGalleryOpen={isGalleryOpen}>
          <MoonLoader color="white" size={30} />
        </ImageContainer>
      );
    }

    if (textContent.includes('brc-20')) {
      return (
        <Brc20Tile
          brcContent={textContent}
          isGalleryOpen={isGalleryOpen}
          isNftDashboard={isNftDashboard}
          inNftDetail={inNftDetail}
          isSmallImage={isSmallImage}
        />
      );
    }
    return (
      <ImageContainer isSmallImage={isSmallImage} inNftDetail={inNftDetail} isGalleryOpen={isGalleryOpen}>
        <OrdinalContentText inNftSend={inNftSend}>{textContent}</OrdinalContentText>
        {isNftDashboard && (
        <OrdinalsTag>
          <ButtonIcon src={OrdinalsIcon} />
          <Text>{t('ORDINAL')}</Text>
        </OrdinalsTag>
        )}
      </ImageContainer>
    );
  }

  return (
    <ImageContainer isSmallImage={isSmallImage} isGalleryOpen={isGalleryOpen}>
      <img src={PlaceholderImage} alt="ordinal" />
    </ImageContainer>
  );
}

export default OrdinalImage;
