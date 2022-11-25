import { Suspense } from 'react';
import styled from 'styled-components';
import { Ring } from 'react-spinners-css';
import Img from 'react-image';
import { TokenMetaData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { getFetchableUrl } from '@utils/helper';
import NftPlaceholderImage from '@assets/img/nftDashboard/ic_nft_diamond.svg';

const ImageContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  overflow: 'hidden',
  flex: 1,
});

const Video = styled.video({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const StyledImg = styled(Img)`
  border-radius: 8px;
  object-fit: contAIN;
`;
interface Props {
  metadata: TokenMetaData;
}

const showNftImagePlaceholder = (
  <ImageContainer>
    <img src={NftPlaceholderImage} alt="nft" />
  </ImageContainer>
);

function NftImage({ metadata }: Props) {
  if (metadata?.image_protocol) {
    return (
      <Suspense>
        <ImageContainer>
          <StyledImg
            width="100%"
            maxHeight="50px"
            src={getFetchableUrl(metadata.image_url ?? '', metadata.image_protocol ?? '')}
            loader={(
              <ImageContainer>
                <Ring color="white" size={30} />
              </ImageContainer>
          )}
            unloader={showNftImagePlaceholder}
          />
        </ImageContainer>

      </Suspense>
    );
  }

  if (metadata?.asset_protocol) {
    return (
      <Video src={getFetchableUrl(metadata.asset_url ?? '', metadata.asset_protocol ?? '')} loop playsInline controls preload="auto" />
    );
  }

  return (
    <ImageContainer>
      <Ring color="white" size={30} />
    </ImageContainer>
  );
}

export default NftImage;
