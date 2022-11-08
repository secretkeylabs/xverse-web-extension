import { Suspense } from 'react';
import styled from 'styled-components';
import { Ring } from 'react-spinners-css';
import { TokenMetaData } from '@secretkeylabs/xverse-core/types/api/stacks/assets';
import { getFetchableUrl } from '@utils/helper';
import NftPlaceholderImage from '@assets/img/nftDashboard/ic_nft_diamond.svg';
import Img from 'react-image';

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

const showloader = (
  <ImageContainer>
    <Ring color="white" size={30} />
  </ImageContainer>
);

const showNftImagePlaceholder = (
  <ImageContainer>
    <img src={NftPlaceholderImage} alt="nft" />
  </ImageContainer>
);

function NftImage({ metadata }: Props) {
  if (metadata?.image_protocol) {
    return (
      <Suspense>
        <Img width="100%" src={getFetchableUrl(metadata.image_url ?? '', metadata.image_protocol ?? '')} loader={showloader} unloader={showNftImagePlaceholder} />
      </Suspense>
    );
  }

  if (metadata?.asset_protocol) {
    return (
      <ImageContainer>
        <Video src={getFetchableUrl(metadata.asset_url ?? '', metadata.asset_protocol ?? '')} />
      </ImageContainer>
    );
  }

  return (
    showloader
  );
}

export default NftImage;
