import NftPlaceholderImage from '@assets/img/nftDashboard/ic_nft_diamond.svg';
import { BetterBarLoader } from '@components/barLoader';
import { TokenMetaData } from '@secretkeylabs/xverse-core';
import { getFetchableUrl } from '@utils/helper';
import Image from 'rc-image';
import { Suspense } from 'react';
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';

interface ContainerProps {
  isGalleryOpen: boolean;
}

const ImageContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: props.isGalleryOpen ? '100%' : 150,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: 8,
  aspectRatio: '1',
}));

const LoaderContainer = styled.div({
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

const StyledBarLoader = styled(BetterBarLoader)((props) => ({
  padding: 0,
  borderRadius: props.theme.radius(1),
}));

const Video = styled.video({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 8,
});

const StyledImg = styled(Image)`
  border-radius: 8px;
  object-fit: contain;
  height: 150;
`;
interface Props {
  metadata: TokenMetaData;
  isInCollage?: boolean;
}

function NftImage({ metadata, isInCollage = false }: Props) {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  if (metadata?.image_protocol) {
    return (
      <ImageContainer isGalleryOpen={isGalleryOpen || isInCollage}>
        <Suspense>
          <StyledImg
            width="100%"
            preview={false}
            src={getFetchableUrl(metadata.image_url ?? '', metadata.image_protocol ?? '')}
            placeholder={
              <LoaderContainer>
                <StyledBarLoader
                  width={isGalleryOpen ? 276 : 151}
                  height={isGalleryOpen ? 276 : 151}
                />
              </LoaderContainer>
            }
            fallback={NftPlaceholderImage}
          />
        </Suspense>
      </ImageContainer>
    );
  }
  if (metadata?.asset_protocol) {
    return (
      <Video
        src={getFetchableUrl(metadata.asset_url ?? '', metadata.asset_protocol ?? '')}
        loop
        playsInline
        controls
        preload="auto"
      />
    );
  }

  return (
    <ImageContainer isGalleryOpen={isGalleryOpen}>
      <MoonLoader color="white" size={30} />
    </ImageContainer>
  );
}

export default NftImage;
