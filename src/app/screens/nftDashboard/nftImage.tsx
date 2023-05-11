import { Suspense, useMemo } from 'react';
import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';
import Image from 'rc-image';
import { TokenMetaData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { getFetchableUrl } from '@utils/helper';
import NftPlaceholderImage from '@assets/img/nftDashboard/ic_nft_diamond.svg';

interface ContainerProps {
  isGalleryOpen: boolean;
}

const ImageContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: props.isGalleryOpen ? 'center' : 'flex-start',
  width: '100%',
  height: props.isGalleryOpen ? '100%' : 150,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: 8,
}));

const LoaderContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  width: '100%',
  left: 0,
  bottom: 0,
  right: 0,
  top: 0,
  height: props.isGalleryOpen ? '100%' : 150,
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
}

function NftImage({ metadata }: Props) {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const imgUrl = useMemo(() => getFetchableUrl(metadata.image_url ?? '', metadata.image_protocol ?? ''), [metadata]);
  if (metadata?.image_protocol) {
    return (
      <ImageContainer isGalleryOpen={isGalleryOpen}>
        <Suspense>
          <StyledImg
            width="100%"
            src={imgUrl}
            placeholder={(
              <LoaderContainer isGalleryOpen={isGalleryOpen}>
                <MoonLoader color="white" size={25} />
              </LoaderContainer>
              )}
            fallback={NftPlaceholderImage}
          />
        </Suspense>
      </ImageContainer>
    );
  }
  if (metadata?.asset_protocol) {
    return (
      <Video src={getFetchableUrl(metadata.asset_url ?? '', metadata.asset_protocol ?? '')} loop playsInline controls preload="auto" />
    );
  }

  return (
    <ImageContainer isGalleryOpen={isGalleryOpen}>
      <MoonLoader color="white" size={30} />
    </ImageContainer>
  );
}

export default NftImage;
