import PlaceholderImage from '@assets/img/nftDashboard/nft_fallback.svg';
import { BetterBarLoader } from '@components/barLoader';
import useXverseApi from '@hooks/apiClients/useXverseApi';
import useTextOrdinalContent from '@hooks/useTextOrdinalContent';
import useWalletSelector from '@hooks/useWalletSelector';
import { TextT } from '@phosphor-icons/react';
import {
  getBrc20Details,
  type CondensedInscription,
  type Inscription,
} from '@secretkeylabs/xverse-core';
import { POPUP_WIDTH, XVERSE_ORDIVIEW_URL } from '@utils/constants';
import { getFetchableUrl } from '@utils/helper';
import { isThumbnailInscription } from '@utils/inscriptions';
import Image from 'rc-image';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';
import Brc20Tile from './brc20Tile';

interface ContainerProps {
  isGalleryOpen?: boolean;
  inNftDetail?: boolean;
}

const ImageContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: props.inNftDetail ? props.theme.spacing(8) : 0,
  alignItems: 'center',
  width: '100%',
  aspectRatio: '1',
  overflow: 'hidden',
  position: 'relative',
  fontSize: '3em',
  wordWrap: 'break-word',
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: props.theme.radius(2),
  '> img': {
    width: '100%',
  },
}));

const LoaderContainer = styled.div<ContainerProps>({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  width: '100%',
  left: 0,
  bottom: 0,
  right: 0,
  top: 0,
});

interface TextProps {
  inNftSend?: boolean;
  isSmall?: boolean;
  blur?: boolean;
  withoutSizeIncrease?: boolean;
  isGalleryOpen?: boolean;
}

const OrdinalContentText = styled.p<TextProps>((props) => {
  let fontSize = 'calc(0.8vw + 2vh)';
  if (props.isSmall) {
    fontSize = 'calc(2vw)';
  } else if (props.inNftSend || props.withoutSizeIncrease) {
    fontSize = '15px';
  }
  return {
    ...props.theme.typography.body_medium_m,
    color: props.theme.colors.white_0,
    fontSize,
    overflow: 'hidden',
    textAlign: 'center',
    filter: `blur(${props.blur ? '3px' : 0})`,
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': '4',
    '-webkit-box-orient': 'vertical',
    margin: props.isGalleryOpen ? props.theme.space.xxl : props.theme.space.xs,
  };
});

const StyledImage = styled(Image)`
  border-radius: ${({ theme }) => theme.radius(2)}px;
  object-fit: contain;
  image-rendering: pixelated;
  display: flex;
`;
const ContentTypeThumbnailContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.theme.colors.white_0};
`;

const StyledBarLoader = styled(BetterBarLoader)((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
  marginBottom: 0,
}));

type Props = {
  ordinal: Inscription | CondensedInscription;
  inNftDetail?: boolean;
  inNftSend?: boolean;
  isSmallImage?: boolean;
  withoutSizeIncrease?: boolean;
  withoutTitles?: boolean;
  placeholderIcon?: string;
  showContentTypeThumbnail?: boolean;
  thumbnailTimestamp?: number;
};

function OrdinalImage({
  ordinal,
  inNftDetail = false,
  inNftSend = false,
  isSmallImage = false,
  withoutSizeIncrease = false,
  withoutTitles = false,
  placeholderIcon,
  showContentTypeThumbnail = false,
  thumbnailTimestamp = Date.now(),
}: Props) {
  const isGalleryOpen: boolean =
    document.documentElement.clientWidth > POPUP_WIDTH && !withoutSizeIncrease;
  const textContent = useTextOrdinalContent(ordinal);
  const { t } = useTranslation('translation', { keyPrefix: 'NFT_DASHBOARD_SCREEN' });
  const [brc721eImage, setBrc721eImage] = useState<string | undefined>(undefined);
  const { network } = useWalletSelector();
  const xverseApiClient = useXverseApi();

  useEffect(() => {
    const fetchBrc721eMetadata = async () => {
      if (!textContent) {
        return;
      }

      try {
        const parsedContent = JSON.parse(textContent);
        const erc721Metadata = await xverseApiClient.getErc721Metadata(
          parsedContent.contract,
          parsedContent.token_id,
        );

        const url = getFetchableUrl(erc721Metadata, 'ipfs');

        if (url) {
          const ipfsMetadata = await (await fetch(url)).json();
          setBrc721eImage(getFetchableUrl(ipfsMetadata.image, 'ipfs'));
        }
      } catch (e) {
        console.error(e); // eslint-disable-line no-console
      }
    };

    if (textContent?.includes('brc-721e')) {
      fetchBrc721eMetadata();
    }
  }, [textContent, network.type]);

  let loaderSize = 151;
  if (inNftDetail && isGalleryOpen) {
    loaderSize = 376.5;
  } else if (isGalleryOpen) {
    loaderSize = 276;
  }

  const renderImage = (tag: string, src?: string) => (
    <ImageContainer key={thumbnailTimestamp}>
      <StyledImage
        data-testid="token-image"
        width="100%"
        height="100%"
        placeholder={
          <LoaderContainer>
            <StyledBarLoader width={loaderSize} height={loaderSize} />
          </LoaderContainer>
        }
        src={src}
        preview={false}
      />
    </ImageContainer>
  );

  const contentType = ordinal?.content_type ?? '';

  const brc20Details = useMemo(
    () => getBrc20Details(textContent!, contentType),
    [textContent, contentType],
  );

  if (isThumbnailInscription(ordinal)) {
    return renderImage(
      t('ORDINAL'),
      `${XVERSE_ORDIVIEW_URL(network.type)}/thumbnail/${ordinal.id}`,
    );
  }

  if (contentType.includes('image')) {
    return renderImage(t('ORDINAL'), `${XVERSE_ORDIVIEW_URL(network.type)}/content/${ordinal.id}`);
  }

  if (textContent?.includes('brc-721e')) {
    return renderImage('BRC-721e', brc721eImage);
  }

  if (brc20Details) {
    return (
      <ImageContainer>
        <Brc20Tile
          brcContent={brc20Details}
          isGalleryOpen={isGalleryOpen}
          inNftDetail={inNftDetail}
          isSmallImage={isSmallImage}
          withoutSizeIncrease={withoutSizeIncrease}
          withoutTitles={withoutTitles}
        />
      </ImageContainer>
    );
  }

  if (contentType.includes('text') || contentType === 'application/json') {
    if (!textContent) {
      return <StyledBarLoader width={loaderSize} height={loaderSize} />;
    }

    if (showContentTypeThumbnail) {
      return (
        <ImageContainer data-testid="token-image">
          <ContentTypeThumbnailContainer>
            <TextT width="50%" height="50%" color={Theme.colors.elevation0} />
          </ContentTypeThumbnailContainer>
        </ImageContainer>
      );
    }

    return (
      <ImageContainer inNftDetail={inNftDetail} isGalleryOpen={isGalleryOpen}>
        <OrdinalContentText
          inNftSend={inNftSend}
          isSmall={isSmallImage}
          withoutSizeIncrease={withoutSizeIncrease}
          isGalleryOpen={isGalleryOpen}
        >
          {textContent}
        </OrdinalContentText>
      </ImageContainer>
    );
  }

  return (
    <ImageContainer data-testid="token-image">
      <img src={placeholderIcon ?? PlaceholderImage} alt="ordinal" />
    </ImageContainer>
  );
}

export default OrdinalImage;
