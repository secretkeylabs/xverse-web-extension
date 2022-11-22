import { Suspense } from 'react';
import styled from 'styled-components';
import { Ring } from 'react-spinners-css';
import Img from 'react-image';
import { TokenMetaData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { getFetchableUrl } from '@utils/helper';
import NftPlaceholderImage from '@assets/img/nftDashboard/ic_nft_diamond.svg';

const ImageContainer = styled.div((props) => ({
  padding: props.theme.spacing(10),
  borderRadius: props.theme.radius(2),
  marginBottom: props.theme.spacing(4),
}));

const Video = styled.video({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

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
        <Img
          width="100%"
          src={getFetchableUrl(metadata.image_url ?? '', metadata.image_protocol ?? '')}
          loader={(
            <ImageContainer>
              <Ring color="white" size={30} />
            </ImageContainer>
          )}
          unloader={showNftImagePlaceholder}
        />
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
