import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';
import OrdinalsIcon from '@assets/img/nftDashboard/white_ordinals_icon.svg';
import { getFetchableUrl } from '@utils/helper';
import PlaceholderImage from '@assets/img/nftDashboard/nft_fallback.svg';
import PlaceholderHtml from '@assets/img/nftDashboard/code.svg';
import { useTranslation } from 'react-i18next';
import { Inscription, getErc721Metadata } from '@secretkeylabs/xverse-core';
import useTextOrdinalContent from '@hooks/useTextOrdinalContent';
import Image from 'rc-image';
import { useEffect, useState } from 'react';
import ActionButton from '@components/button';
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
  height: props.isGalleryOpen ? (props.inNftDetail ? 540 : 300) : props.isSmallImage ? 50 : 150,
  minHeight: props.isGalleryOpen ? 300 : props.isSmallImage ? 50 : 150,
  maxHeight: props.isGalleryOpen ? (props.inNftDetail ? 450 : 300) : props.isSmallImage ? 50 : 150,
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
  isSmall?: boolean;
  blur?: boolean
  withoutSizeIncrease?: boolean;
}

const OrdinalContentText = styled.h1<TextProps>((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
  fontSize: (props.inNftSend || props.withoutSizeIncrease) ? 15 : 'calc(0.8vw + 2vh)',
  overflow: 'hidden',
  textAlign: 'center',
  filter: `blur(${props.blur ? '3px' : 0})`,
}));

const StyledImage = styled(Image)`
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
  withoutSizeIncrease?: boolean;
}

function OrdinalImage({
  ordinal,
  isNftDashboard = false,
  inNftDetail = false,
  inNftSend = false,
  isSmallImage = false,
  withoutSizeIncrease = false,
}: Props) {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360 && !withoutSizeIncrease;
  const textContent = useTextOrdinalContent(ordinal);
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const [brc721eImage, setBrc721eImage] = useState<string | undefined>(undefined);

  const fetchBrc721eMetadata = async () => {
    if (!textContent) {
      return;
    }

    try {
      const parsedContent = JSON.parse(textContent);
      const erc721Metadata = await getErc721Metadata(parsedContent.contract, parsedContent.token_id);

      const url = getFetchableUrl(erc721Metadata, 'ipfs');

      if (url) {
        const ipfsMetadata = await (await fetch(url)).json();
        setBrc721eImage(getFetchableUrl(ipfsMetadata.image, 'ipfs'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (textContent?.includes('brc-721e')) {
      fetchBrc721eMetadata();
    }
  }, [textContent]);

  const renderImage = (tag: string, src?: string) => (
    <ImageContainer isSmallImage={isSmallImage} isGalleryOpen={isGalleryOpen}>
      <StyledImage
        width="100%"
        placeholder={(
          <LoaderContainer isGalleryOpen={isGalleryOpen}>
            <MoonLoader color="white" size={20} />
          </LoaderContainer>
          )}
        src={src}
      />
      {isNftDashboard && (
        <OrdinalsTag>
          <ButtonIcon src={OrdinalsIcon} />
          <Text>{tag}</Text>
        </OrdinalsTag>
      )}
    </ImageContainer>
  );

  if (ordinal?.content_type.includes('image')) {
    return renderImage(t('ORDINAL'), getFetchableUrl(`https://api.hiro.so/ordinals/v1/inscriptions/${ordinal.id}/content`, 'http'));
  }

  if (textContent?.includes('brc-721e')) {
    return renderImage('BRC-721e', brc721eImage);
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
    if (ordinal?.content_type.includes('html')) {
      return (
        <ImageContainer
          isSmallImage={isSmallImage}
          inNftDetail={inNftDetail}
          isGalleryOpen={isGalleryOpen}
        >
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <img src={PlaceholderHtml} />
            <OrdinalContentText>.html</OrdinalContentText>
          </div>
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
      <ImageContainer isSmallImage={isSmallImage} inNftDetail={inNftDetail} isGalleryOpen={isGalleryOpen}>
        <OrdinalContentText inNftSend={inNftSend} isSmall={isSmallImage} withoutSizeIncrease={withoutSizeIncrease}>{textContent}</OrdinalContentText>
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
