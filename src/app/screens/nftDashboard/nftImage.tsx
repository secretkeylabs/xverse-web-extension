import { Suspense } from 'react';
import styled from 'styled-components';
import { MoonLoader } from 'react-spinners';
import Image from 'rc-image';
import { TokenMetaData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { getFetchableUrl } from '@utils/helper';
import NftPlaceholderImage from '@assets/img/nftDashboard/ic_nft_diamond.svg';

const ImageContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  flex: 1,
  height: 156,
  overflow: 'hidden',
});

const LoaderContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Video = styled.video({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const StyledImg = styled(Image)`
  border-radius: 8px;
  object-fit: contain;
`;
interface Props {
  metadata: TokenMetaData;
}

function NftImage({ metadata }: Props) {
  if (metadata?.image_protocol) {
    return (
      <ImageContainer>
        <Suspense>
          <StyledImg
            width="100%"
            placeholder={(
              <LoaderContainer>
                <MoonLoader color="white" size={25} />
              </LoaderContainer>
            )}
            src={getFetchableUrl(metadata.image_url ?? '', metadata.image_protocol ?? '')}
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
    <ImageContainer>
      <MoonLoader color="white" size={30} />
    </ImageContainer>
  );
}

export default NftImage;
