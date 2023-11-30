import NftUser from '@assets/img/nftDashboard/bns.svg';
import useNftDetail from '@hooks/queries/useNftDetail';
import { NonFungibleToken } from '@secretkeylabs/xverse-core';
import { isBnsContract } from '@utils/nfts';
import styled from 'styled-components';
import NftImage from './nftImage';

interface Props {
  asset: NonFungibleToken;
  isGalleryOpen: boolean;
}
interface ContainerProps {
  isGalleryView: boolean;
}

const NftImageContainer = styled.div<ContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  width: '100%',
  aspectRatio: '1',
  overflow: 'hidden',
  borderRadius: 8,
  background: props.theme.colors.elevation1,
  '> img': {
    width: '100%',
  },
  flexGrow: props.isGalleryView ? 1 : 'initial',
}));

const GridItemContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.colors.white_0,
  padding: 0,
  borderRadius: props.theme.radius(3),
  flex: 1,
  aspectRatio: '1',
}));

const BnsImage = styled.img({
  width: '100%',
  height: '100%',
});

function Nft({ asset, isGalleryOpen }: Props) {
  const { data } = useNftDetail(asset.identifier);
  return (
    <GridItemContainer>
      <NftImageContainer isGalleryView={isGalleryOpen}>
        {isBnsContract(asset?.asset_identifier) ? (
          <BnsImage src={NftUser} alt="user" />
        ) : (
          <NftImage metadata={data?.data?.token_metadata} isInCollage />
        )}
      </NftImageContainer>
    </GridItemContainer>
  );
}
export default Nft;
